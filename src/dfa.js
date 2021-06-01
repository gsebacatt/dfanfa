module.exports = {
    toDfa,
    getEClosure,
    minimize,
}


//Tener definido el lenguaje
const L = ['a','b'];


function Minimize(dfa){

}


//Subconjuntos
function toDfa(nfa){
    console.log(nfa)
    //Recordar que el nfa es un stack en un array
   let dfa = new Set();

    dfa.add(getEclosure(nfa.start));

    dfa.forEach(state => {
        console.log(state)
        if(!state.marked){
           state.marked = true;


           L.forEach(symbol => {
               let U  = getEClosure(mover(dfa,state, symbol));

               if(!dfa.has(U)){
                   U.marked = true;
                   dfa.add(U);
               }
           })

        }
    })
}



//Para que eclosure funcione, mover deberia retornar un estado
function mover(dfa, state,symbol){
   let tempSet = new Set(...dfa[state], symbol);
   return tempSet;
}


function getEClosure(initialState){
    let closure  = new Set();

    let neighbours = initialState.epsilonTransitions;

    neighbours.forEach(neighbour => {
            closure.add(getEClosure(neighbour))
    })

    return closure;

}

function minimize(dfa){
    return [];
}
