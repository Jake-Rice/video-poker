import Deck, { Card } from './deck.js'

const VALUE_ORDER = {
    "A": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    "J": 11,
    "Q": 12,
    "K": 13
}

const MAX_BET = 5

let deck, hand, holds
let gameStarted = false
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
    else {
        gameStarted = false
        for (let i=0; i<hand.length; i++) {
            if (!holds[i]) hand[i] = deck.draw()
            document.getElementById('card'+i).innerText = hand[i].value+hand[i].suit
        }
        console.log(judgeHand(), calculatePayout(judgeHand()))        
    }
})

for (let i=0; i<5; i++) {
    document.getElementById('btn-hold'+i).addEventListener('click', () => {
        if (gameStarted) {
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
    credits -= bet
    document.getElementById('credit-label').innerText = "CREDITS " + credits
    resetHolds()
    deck = new Deck()
    deck.shuffle()

    hand = [deck.draw(), deck.draw(), deck.draw(), deck.draw(), deck.draw()]

    //TEST HANDS - uncomment to use
    //hand = [new Card("♠","A"), new Card("♠","10"), new Card("♠","Q"), new Card("♠","J"), new Card("♠","K")] //royal flush
    //hand = [new Card("♠","9"), new Card("♠","10"), new Card("♠","Q"), new Card("♠","J"), new Card("♠","K")] //straight flush
    //hand = [new Card("♠","4"), new Card("♦","6"), new Card("♥","6"), new Card("♣","6"), new Card("♠","6")] //four of a kind
    //hand = [new Card("♠","4"), new Card("♦","4"), new Card("♥","6"), new Card("♣","6"), new Card("♠","6")] //full house
    //hand = [new Card("♠","4"), new Card("♠","5"), new Card("♠","7"), new Card("♠","6"), new Card("♠","A")] //flush
    //hand = [new Card("♠","4"), new Card("♦","5"), new Card("♥","7"), new Card("♣","6"), new Card("♠","3")] //straight
    //hand = [new Card("♠","4"), new Card("♦","5"), new Card("♥","6"), new Card("♣","6"), new Card("♠","6")] //three of a kind
    //hand = [new Card("♠","5"), new Card("♦","5"), new Card("♥","3"), new Card("♣","6"), new Card("♠","3")] //two pair
    //hand = [new Card("♠","4"), new Card("♦","J"), new Card("♥","J"), new Card("♣","6"), new Card("♠","3")] //jacks or better
    //hand = [new Card("♠","4"), new Card("♦","5"), new Card("♥","7"), new Card("♣","6"), new Card("♠","A")] //nothing

    gameStarted = true
    
    hand.forEach((card, pos) => {
        document.getElementById('card'+pos).innerText = card.value+card.suit
        document.getElementById('card'+pos).style = "font-family: monospace; font-size: 60px;"
    })    
}

function resetHolds() {
    holds = [false, false, false, false, false]
    for (let i=0; i<5; i++) {
        document.getElementById('hold'+i).style = 'display: none'
    }
}

function judgeHand() {    
    let sortedHand = [...hand]
    sortedHand.sort((a,b) => {
        if (VALUE_ORDER[a.value] > VALUE_ORDER[b.value]) return 1
        if (VALUE_ORDER[a.value] < VALUE_ORDER[b.value]) return -1
        return 0
    })
    //check for flush
    let suit = sortedHand[0].suit
    let flush = true
    for (let i=1; i<sortedHand.length; i++) {
        if (sortedHand[i].suit!==suit) flush = false
    }
    if (!flush) {
        //if not flush, check for straight
        let straight = true
        for (let i=1; i<sortedHand.length-1; i++) {
            if (VALUE_ORDER[sortedHand[i].value] !== VALUE_ORDER[sortedHand[i-1].value]+1) straight = false
        }
        if (straight && VALUE_ORDER[sortedHand[sortedHand.length-1].value] !== VALUE_ORDER[sortedHand[sortedHand.length-2].value]+1) {
            //check for ace-high straight
            if (VALUE_ORDER[sortedHand.length-2].value!==13 || VALUE_ORDER[sortedHand.length-1].value!==1) straight = false
        }
        if (straight) return "straight"

        //not straight, check for matching cards
        let matches = []
        let running = 1
        for (let i=1; i<sortedHand.length; i++) {
            if (sortedHand[i].value===sortedHand[i-1].value) running++
            else if (running > 1) {
                matches.push(running)
                running = 1
            }
        }
        if (running > 1) matches.push(running)
        
        //check for four of a kind
        if (matches[0]===4) return "four of a kind"
        //check for full house or three of a kind
        if (matches.indexOf(3) >= 0) {
            if (matches.indexOf(2) >= 0) return "full house"
            return "three of a kind"
        }
        //check for pairs
        if (matches.indexOf(2) >= 0) {
            //check for two pair
            if (matches.length>1) return "two pair"
            //check for jacks or better
            for (let i=1; i<sortedHand.length; i++) {
                if (VALUE_ORDER[sortedHand[i].value] === VALUE_ORDER[sortedHand[i-1].value]) {
                    if (VALUE_ORDER[sortedHand[i].value] > 10 || VALUE_ORDER[sortedHand[i].value] === 1) return "jacks or better"
                }
            }
        }
        return "nothing"
    }
    //if flush, check for straight flush
    let straight = true
    for (let i=2; i<sortedHand.length; i++) {
        if (VALUE_ORDER[sortedHand[i].value] !== VALUE_ORDER[sortedHand[i-1].value]+1) straight = false
    }
    if (straight && VALUE_ORDER[sortedHand[1].value] !== VALUE_ORDER[sortedHand[0].value]+1) {
        //check for royal flush        
        if (VALUE_ORDER[sortedHand[sortedHand.length-1].value]===13 && VALUE_ORDER[sortedHand[0].value]===1) return "royal flush"
        straight = false
    }
    if (straight) return "straight flush"
    return "flush"
}

function calculatePayout(strHand) {
    const HAND_SCORES = {
        "royal flush": (bet===MAX_BET) ? 4000 : 250*bet,
        "straight flush": 50*bet,
        "four of a kind": 25*bet,
        "full house": 9*bet,
        "flush": 6*bet,
        "straight": 4*bet,
        "three of a kind": 3*bet,
        "two pair": 2*bet,
        "jacks or better": bet,
        "nothing": 0
    }
    return HAND_SCORES[strHand]
}