/*
  Objecto representativo de un estado en el e-NFA
*/
function createState(isEnd) {
    return {
        isEnd,
        //marked para la conversion a dfa
        marked: false,
        transition: {},
        epsilonTransitions: []
    };
}

function addEpsilonTransition(from, to) {
    from.epsilonTransitions.push(to);
}

/*
  Agrega transiciones (ni epsilon) al NDA
*/
function addTransition(from, to, symbol) {
    from.transition[symbol] = to;
}

/*
  NFA que reconoce solo cadenas vacias
*/
function fromEpsilon() {
    const start = createState(false);
    const end = createState(true);
    addEpsilonTransition(start, end);

    return { start, end };
}

/*
   NFA que reconoce un solo caracter
*/
function fromSymbol(symbol) {
    const start = createState(false);
    const end = createState(true);
    addTransition(start, end, symbol);

    return { start, end };
}

/*
   Thompson para concatenaciones
*/
function concat(first, second) {
    addEpsilonTransition(first.end, second.start);
    first.end.isEnd = false;

    return { start: first.start, end: second.end };
}

/*
   Thompson para uniones
*/
function union(first, second) {
    const start = createState(false);
    addEpsilonTransition(start, first.start);
    addEpsilonTransition(start, second.start);

    const end = createState(true);

    addEpsilonTransition(first.end, end);
    first.end.isEnd = false;
    addEpsilonTransition(second.end, end);
    second.end.isEnd = false;

    return { start, end };
}


/*
    Cierre Kleene de Thompson
*/
function closure(nfa) {
    const start = createState(false);
    const end = createState(true);

    addEpsilonTransition(start, end);
    addEpsilonTransition(start, nfa.start);

    addEpsilonTransition(nfa.end, end);
    addEpsilonTransition(nfa.end, nfa.start);
    nfa.end.isEnd = false;

    return { start, end };
}

/*
    Thompson para simbolo ? en regex
*/

function zeroOrOne(nfa) {
    const start = createState(false);
    const end = createState(true);

    addEpsilonTransition(start, end);
    addEpsilonTransition(start, nfa.start);

    addEpsilonTransition(nfa.end, end);
    nfa.end.isEnd = false;

    return { start, end };
}

/*
    Thompson para simbolo + en regex
*/

function oneOrMore(nfa) {
    const start = createState(false);
    const end = createState(true);

    addEpsilonTransition(start, nfa.start);
    addEpsilonTransition(nfa.end, end);
    addEpsilonTransition(nfa.end, nfa.start);
    nfa.end.isEnd = false;

    return { start, end };
}

/*
  Convierte una expresion regular postfi en un NFA mediante Thompson
*/
function toNFA(postfixExp) {
    if (postfixExp === '') {
        return fromEpsilon();
    }

    const stack = [];

    for (const token of postfixExp) {
        if (token === '*') {
            stack.push(closure(stack.pop()));
        } else if (token === "?") {
            stack.push(zeroOrOne(stack.pop()));
        } else if (token === "+") {
            stack.push(oneOrMore(stack.pop()));
        } else if (token === '|') {
            const right = stack.pop();
            const left = stack.pop();
            stack.push(union(left, right));
        } else if (token === '.') {
            const right = stack.pop();
            const left = stack.pop();
            stack.push(concat(left, right));
        } else {
            stack.push(fromSymbol(token));
        }
    }

    return stack.pop();
}

const { toParseTree } = require('./parser2');

function toNFAfromParseTree(root) {
    if (root.label === 'Expr') {
        const term = toNFAfromParseTree(root.children[0]);
        if (root.children.length === 3) // Expr -> Term '|' Expr
            return union(term, toNFAfromParseTree(root.children[2]));

        return term; // Expr -> Term
    }

    if (root.label === 'Term') {
        const factor = toNFAfromParseTree(root.children[0]);
        if (root.children.length === 2) // Term -> Factor Term
            return concat(factor, toNFAfromParseTree(root.children[1]));

        return factor; // Term -> Factor
    }

    if (root.label === 'Factor') {
        const atom = toNFAfromParseTree(root.children[0]);
        if (root.children.length === 2) { // Factor -> Atom MetaChar
            const meta = root.children[1].label;
            if (meta === '*')
                return closure(atom);
            if (meta === '+')
                return oneOrMore(atom);
            if (meta === '?')
                return zeroOrOne(atom);
        }

        return atom; // Factor -> Atom
    }

    if (root.label === 'Atom') {
        if (root.children.length === 3) // Atom -> '(' Expr ')'
            return toNFAfromParseTree(root.children[1]);

        return toNFAfromParseTree(root.children[0]); // Atom -> Char
    }

    if (root.label === 'Char') {
        if (root.children.length === 2) // Char -> '\' AnyChar
            return fromSymbol(root.children[1].label);

        return fromSymbol(root.children[0].label); // Char -> AnyCharExceptMeta
    }

    throw new Error('Unrecognized node label ' + root.label);
}

function toNFAFromInfixExp(infixExp) {
    if (infixExp === '')
        return fromEpsilon();

    return toNFAfromParseTree(toParseTree(infixExp));
}

function recursiveBacktrackingSearch(state, visited, input, position) {
    if (visited.includes(state)) {
        return false;
    }

    visited.push(state);

    if (position === input.length) {
        if (state.isEnd) {
            return true;
        }

        if (state.epsilonTransitions.some(s => recursiveBacktrackingSearch(s, visited, input, position))) {
            return true;
        }
    } else {
        const nextState = state.transition[input[position]];

        if (nextState) {
            if (recursiveBacktrackingSearch(nextState, [], input, position + 1)) {
                return true;
            }
        } else {
            if (state.epsilonTransitions.some(s => recursiveBacktrackingSearch(s, visited, input, position))) {
                return true;
            }
        }

        return false;
    }
}

/*
   Explora las transiciones epsilon de un estado hasta encontrar otro estado con una transicion (no episilon)
   Y agrega al array nextStates
*/
function addNextState(state, nextStates, visited) {
    if (state.epsilonTransitions.length) {
        for (const st of state.epsilonTransitions) {
            if (!visited.find(vs => vs === st)) {
                visited.push(st);
                addNextState(st, nextStates, visited);
            }
        }
    } else {
        nextStates.push(state);
    }
}

/*
  Por cada simbolo, se desplaza a varios estados al mismo tiempo
  Hay match con el string en el automata si al leer el ultimo simbolo se llego al estado final
*/
function search(nfa, word) {
    let currentStates = [];
    /* El estado inicial serai nfa.start o los estados alcanzables por transiciones epsilon desde nfa.start */
    addNextState(nfa.start, currentStates, []);

    for (const symbol of word) {
        const nextStates = [];

        for (const state of currentStates) {
            const nextState = state.transition[symbol];
            if (nextState) {
                addNextState(nextState, nextStates, []);
            }
        }

        currentStates = nextStates;
    }

    return currentStates.find(s => s.isEnd) ? true : false;
}

function recognize(nfa, word) {
    // return recursiveBacktrackingSearch(nfa.start, [], word, 0);
    return search(nfa, word);
}

module.exports = {
    toNFA,
    toNFAFromInfixExp,
    recognize
};
