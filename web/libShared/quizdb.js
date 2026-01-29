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
    return null;
  } finally {
    client.release();
  }
}


//game create

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

//game start 
export async function gameStart(id){
const client  = await pool.connect();
try{
await client.query('UPDATE public.game SET time_started=NOW() WHERE id=$1', [id]);
return id;
}catch(err){
  console.error('Error starting game:', err.message);
  return null;
}finally{
  client.release();
}
}




//game remove
export async function gameRemove(id){

  const client  =  await pool.connect()

  try {
    await client.query('DELETE FROM public.game WHERE id=$1', [id])
    return id;
  } catch (error) {
    console.error('Error removing game:', error.message);
    return null;
  }finally{
    client.release();
  }

}



//game player add
export async function gamePlayerAdd(id){
 const client= await pool.client()
 
 try {
  await client.query('INSERT INTO public.game_player(game_id, type, data) VALUES($1,$2,$3) RETURNING id', [id, 'player', {}])
  return id;
 } catch (error) {
  console.error('Error adding player:', error.message);
  return null;
 }finally{
  client.release();
 }
}

//remove player

export async function playerRemove(playerId){
  const client = await pool.connect()

  try {
    await client.query('DELETE FROM public.game_player WHERE id=$1', [playerId],
      )
      return true;
    
  } catch (error) {
    console.error('Error removing player:', error.message);
    return null;
  }finally{
    client.release();
  }
}



export async function playerFetch(game_id){

 const client = await pool.connect()
 
 try {
 const result = await client.query('SELECT * FROM  public.game_player WHERE game_id=$1',[game_id])
return result;
 } catch (error) {
   console.error('ERROR fetching player :', error.message)
 }finally{
  pool.realse()
 }

}



//fetch next question and answer set

export async function questionFetch(qNumber){

const client =  await pool.connect()
const qCount =  await questionCount();
try {
  const question = await client.query('SELECT * FROM public.questions WHERE id=$1' , [qNumber % qCount])


  if(question !==1) return null;


  const answers =  await client.query("SELECT * FROM public.answers WHERE question_id=$1" , [question.rows[0].id])

  if(!answers.length) return null


  return {
    question: question.rows[0].text,
    answers: answers.rows.map(a=>({
      text: a.text,
      correct: a.is_correct
    }))
  }
} catch (error) {
  console.error('Error fetching question:', error.message)
  return null;
}finally{
  client.release();
}


}

export function clamp(min=0, value=0, max=0){
return Math.max(min,  Math.min(parseInt(value || '0', 10) || 0, max))
}