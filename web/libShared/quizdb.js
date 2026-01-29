import pool from '../db.js';


export async function questionCount(){
    const client  = await pool.connect();
    try{
        const res = await client.query('SELECT COUNT(*) AS count FROM public.questions')
        return parseInt(res.rows[0].count,10)
    }catch(err){
        console.error('Error getting question count:', err.message);
        return 0;
    }finally{
        client.release();
    }
}


export async function questionAdd(question, answers) {
  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");

    const maxId = await client.query("SELECT MAX(id) as max_id FROM public.questions");
    const nextId = (maxId.rows[0].max_id || 0) + 1;

    const questionResult = await client.query(
      'INSERT INTO public.questions(id, text) VALUES($1, $2) RETURNING id',
      [nextId, question]
    );

    const questionId = questionResult.rows[0].id;

    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      const answerId = questionId * 10 + i;

      await client.query(
        'INSERT INTO public.answers(id, text, is_correct, question_id) VALUES($1, $2, $3, $4)',
        [answerId, answer.text, answer.correct, questionId]
      );
    }

    await client.query("COMMIT");
    return true;
    
  } catch (err) {
    await client.query("ROLLBACK");
    console.error('Error adding question:', err.message);
    return false;
  } finally {
    client.release();
  }
}


//game start

export const gameCreate = async (data)=>{
  const client =  await pool.connect()
   const qCount = await questionCount();

   try{
    const result = await client.query(`INSERT INTO public.game(question_offset,questions_asked,timeout_answered,score_correct,score_fastest,score_incorrect,score_noanswer) VALUES($1,$2,$3,$4,$5,$6,$7)
  RETURNING id`,
  [
    Math.random() * qCount,
    clamp(1,data.question_asked, 10),
    clamp(5, data.timeout_answered, 60),
    clamp(-100, data.score_correct, 100),
    clamp(-100, data.score_fastest, 100),
    clamp(-100, data.score_incorrect, 100),
    clamp(-100, data.score_noanswer, 100)
  ])

  return result.rows[0].id;

   }catch(err){
    console.error('Error creating game:', err.message);
    return null;
   }finally{
    client.release();
   }
}



export function clamp(min=0, value=0, max=0){
return Math.max(min,  Math.min(parseInt(value || '0', 10) || 0, max))
}