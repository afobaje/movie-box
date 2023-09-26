const data=require('./db')
const db=data()


function deleteRow(){
    const [id]=process.argv.slice(2)
    db.run(`DELETE FROM movies WHERE id=?`, [id], error=>{
        if(error){
            return console.error(error.message)
        }
        console.log(`Row with the ID ${id} has been deleted`)
    })
}

deleteRow()