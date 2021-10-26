import Deck, { Card } from './deck.js'

const MAX_BET = 5

let deck, hand, holds
let gameStarted = false
let holdsActive = false
let credits = 2000
let bet = 0

document.getElementById('btn-bet').addEventListener('click', () => {
    if (!gameStarted) increaseBet()
})

document.getElementById('btn-max').addEventListener('click', () => {
    if (!gameStarted) betMax()
})

document.getElementById('btn-dd').addEventListener('click', () => {
    if (bet===0) {
        betMax()
    }    
    else if (!gameStarted) startGame()
})

for (let i=0; i<5; i++) {
    document.getElementById('btn-hold'+i).addEventListener('click', () => {
        if (holdsActive) {
            holds[i] = !holds[i]
            document.getElementById('hold'+i).style = (holds[i]) ? '' : 'display: none'
        }
    })
}

function increaseBet() {
    if (bet < MAX_BET && credits > bet) bet++
    document.getElementById('bet-label').innerText = "BET " + bet
    highlightPaytable()
}

function betMax() {
    if (credits >= MAX_BET) {
        bet = MAX_BET
    }
    else bet = credits

    document.getElementById('bet-label').innerText = "BET " + bet
    highlightPaytable()

    if (bet!==0) startGame()
}

function highlightPaytable() {
    document.getElementById('payout'+bet).style = "background-color: red;"
    if (bet>1) document.getElementById('payout'+(bet-1)).style = ""
}

function startGame() {
    credits -= bet;
    document.getElementById('credit-label').innerText = "CREDITS " + credits
    holds = [false, false, false, false, false]
    deck = new Deck()
    deck.shuffle()
    hand = [deck.draw(), deck.draw(), deck.draw(), deck.draw(), deck.draw()]
    gameStarted = true
    holdsActive = true
    
    console.log(hand)
}