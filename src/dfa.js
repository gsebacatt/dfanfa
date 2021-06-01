module.exports = {
    toDfa,
    getEClosure,
    minimize,
    mover
}


//Tener definido el lenguaje
const L = ['a', 'b', 'c'];


function Minimize(dfa) {

}

function createState(isEnd) {
    return {
        isEnd,
        //Nfa states represent it's composition
        states: new Set(),
        marked: false,
        //Puede tener mas de una transicion
        transitions: {},
    };
}

function addTransition(from, to, symbol) {
    from.transition[symbol] = to;
}

function fromSymbol(symbol) {
    const start = createState(false);
    const end = createState(true);
    addTransition(start, end, symbol);

    return {start, end};
}

function toDfa(nfa) {
    console.log(nfa)
    //Recordar que el nfa es un stack en un array
    let dfa = new Set();

    dfa.add(getEclosure(nfa.start));

    dfa.forEach(state => {
        console.log(state)
        if (!state.marked) {
            state.marked = true;


            L.forEach(symbol => {
                let T = mover(state, symbol);

                let U = new Set();

                T.forEach(t => {
                    U.union(getEClosure(t));
                })

                if (!dfa.has(U)) {
                    U.marked = true;
                    dfa.add(U);
                }
            })

        }
    })

    return dfa;
}

function mover(state, symbol) {
    let tempSet = new Set();

    console.log(state.transition)

    for (const [key, value] in state.transition) {
        if(key === symbol){
            tempSet.add(value)
        }
    }
    return tempSet;
}


function getEClosure(initialState) {
    let closure = new Set();

    let neighbours = initialState.epsilonTransitions;

    neighbours.forEach(neighbour => {
        closure.add(getEClosure(neighbour))
    })

    return closure;

}

function minimize(dfa) {
    return [];
}
