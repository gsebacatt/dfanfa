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
    //Recordar que el nfa es un stack
   let dfa = new Set();

   dfa.add(getEClosure(nfa, nfa.pop()))

    dfa.forEach(state => {
        if(!state.marked){
           state.marked = true;


           L.forEach(symbol => {
               let U  = getEClosure(mover(state, symbol), state);

               if(!dfa.has(U)){
                   U.marked = true;
                   dfa.add(U);
               }
           })

        }
    })
}


function mover(state,symbol){

}


function getEClosure(nfa, initialState){
    let closure  = new Set();

    let neighbours = initialState.epsilonTransitions;

    if( neighbours.lenght > 0){
        neighbours.forEach(neighbour => {
            closure.add(getEClosure(nfa,vecino))
        })
    }

    return closure;

}

function minimize(dfa){
    return [];
}
