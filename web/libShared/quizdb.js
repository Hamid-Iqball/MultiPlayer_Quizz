import pool from '../db.js';


export async function questionCount(){
    const client  = await pool.connect();
    try{
        const res = await client.query('SELECT COUNT(*) AS count FROM public.questions')
        return parseInt(res.rows[0].count,10)
    }catch(err){
        console.error('Error getting question count:', err.message);
        return 0;
    }
}


export async function questionAdd(question, answers) {
const client = await pool.connect()
;
try {
  await pool.query("BEGIN");

  const maxId = await pool.query("SELECT MAX(id) as max_id from public.questions");
  const nextId  = (maxId.rows[0].max_id || 0) + 1;

  const questionResult = await pool.query(
    'INSERT INTO public.questions(id,text) VALUES($1,$2) RETURNING id',
    [nextId, question]
  );


  const questionId = questionResult.rows[0].id;

  for(let i=0; i<answers.length; i++){
    const answer = answers[i];
    const answerId = questionId * 10 + i;


    const answerResults = await pool.query(
      'INSERT INTO public.answers(id,text,is_correct, questioin_id) VALUES($1,$2,$3,$4)',
      [answerId, answer.text, answer.correct, questionId]
    )
  }


  await pool.query("COMMIT");
  return true;
} catch(err){
  await pool.query("ROLLBACK");
  console.error('Error adding question:', err.message);
  return false;
}
}