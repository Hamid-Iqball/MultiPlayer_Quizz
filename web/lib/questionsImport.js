;
import { questionCount, questionAdd } from '../libShared/quizdb.js';
import pool from '../db.js';

// configuration
const
  maxQuestions = parseInt(process.env.QUIZ_QUESTIONS_MAX, 10),
  maxApiCalls = 10,
  maxApiFetch = 50,
  quizApi = `https://opentdb.com/api.php?amount=${ maxApiFetch }`;


// add questions to database, return number imported
export async function questionsImport() {

  let imported = 0;

  try {
    // Get current question count
    const qCount = await questionCount();
 
    // fetch questions from API
    const questions = (await Promise.allSettled(

      // Rate limit API calls and total questions
      Array( Math.min(maxApiCalls, Math.ceil((maxQuestions - qCount) / maxApiFetch)) )
        .fill( quizApi )
        .map( (u, i) => fetch(`${u}#${i}`) )

    )
      .then(

        // parse JSON
        response => Promise.allSettled(
          response.map( res => res.value && res.value.json() )
        )

      )
      .then(

        // extract questions
        json => json.map(j => j && j.value && j.value.results || [])

      ))
      .flat()
      .map(q => {

        // format question and answers
        const
          question = cleanString(q.category.replace(/.+:/,'')) + ': ' + cleanString( q.question ),
          answer = [
            { text: cleanString( q.correct_answer ), correct: true },
            ...q.incorrect_answers.map( i => ({ text: cleanString(i), correct: false }))
          ].sort( (a, b) => {
            return formatAnswer(a.text) > formatAnswer(b.text) ? 1 : -1;
          });

        return { question, answer };

      });

      // add to database in sequence
      for (let q of questions) {
        if (await questionAdd(q.question, q.answer)) {
          imported++;
        }
      }


 
    return imported;

  } catch (err) {
    console.error('Error importing questions:', err.message);
    return 0;
  } finally {
    // Don't close pool - it's shared across the app
  }

}


// format answers for sorting (True/False, numerical, or alphabetical)
function formatAnswer(t) {
  if (t === 'True') return 0;
  if (t === 'False') return 1;
  if (isNaN(t)) return t;
  return parseInt(t, 10);
}


// simple string clean
function cleanString(str) {

  return str
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&#039;/g, '\'')
    .replace(/&quot;|&ldquo;|&rdquo;|&laquo;|&raquo;/g, '"')
    .replace(/&\s+/g, '&amp; ')
    .replace(/\s+/g, ' ');

}

// Export for use in routes (don't auto-run)
