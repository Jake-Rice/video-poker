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
let betRelease = false
let bet = 0
let freeze = false
let hintOn = false

document.getElementById('btn-hint').addEventListener('click', () => {
    if(!freeze && gameStarted) {
        if (!hintOn) {
            hintOn = true
            highlightCard(0)
            highlightCard(1)
            highlightCard(2)
            highlightCard(3)
            highlightCard(4)
        }
        else {
            hintOn = false
            clearHint()
        }
    }
})

document.getElementById('btn-bet').addEventListener('click', () => {
    if (!freeze && !gameStarted) increaseBet()
})

document.getElementById('btn-max').addEventListener('click', () => {
    if (!freeze && !gameStarted) betMax()
})

document.getElementById('btn-dd').addEventListener('click', () => {
    if (!freeze) {
        if (bet===0) betMax()
        else if (!gameStarted) startGame()
        else {
            gameStarted = false
            if (hintOn) clearHint()
            displayHand()
            let result = judgeHand()
            const resultInterval = 500
            if (result !== "nothing") {
                setTimeout(()=> {
                    document.getElementById('win-label').innerText = result.toUpperCase()
                    document.getElementById('win-label').style = ""
                    document.getElementById('winnings-label').style = "width: 100%; justify-text: center;"
                    document.getElementById('winnings-label').innerText = "WIN "+winnings
                }, resultInterval)
            }
            let winnings = calculatePayout(result)        
            const interval = (winnings <= 20) ? 100 : 2000/winnings;
            const startInterval = 1000
            freeze = true
            for (let i=0; i<winnings; i++) {            
                setTimeout(()=> { 
                    credits++
                    document.getElementById('credit-label').innerText = "CREDITS "+credits
                }, interval*i + startInterval)
            }
            document.getElementById('credit-label').innerText = "CREDITS "+credits
            document.getElementById('btn-bet').style = ""
            document.getElementById('btn-max').style = ""
            setTimeout(()=> {
                document.getElementById('game-over').style = ""
                freeze = false;
            }, startInterval + (interval*winnings))
        }
    }
})

for (let i=0; i<5; i++) {
    document.getElementById('btn-hold'+i).addEventListener('click', () => {
        if (!freeze && gameStarted) {
            holds[i] = !holds[i]
            document.getElementById('hold'+i).style = (holds[i]) ? '' : 'display: none'
        }
    })
    document.getElementById('card'+i).addEventListener('click', () => {
        if (!freeze && gameStarted) {
            holds[i] = !holds[i]
            document.getElementById('hold'+i).style = (holds[i]) ? '' : 'display: none'
        }
    })
}

function increaseBet() {
    if (betRelease) {
        bet = 0
        betRelease = false
    }
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
    for (let i=1; i<=MAX_BET; i++) document.getElementById('payout'+i).style = ""    
    document.getElementById('payout'+bet).style = "background-color: red;"
}

function startGame() {
    credits -= bet
    betRelease = true;
    
    document.getElementById('credit-label').innerText = "CREDITS " + credits
    document.getElementById('win-label').style = "visibility: hidden;"
    document.getElementById('btn-bet').style = "visibility: hidden;"
    document.getElementById('btn-max').style = "visibility: hidden;"
    document.getElementById('game-over').style = "visibility: hidden;"
    document.getElementById('winnings-label').style = "visibility: hidden;"
    
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
    
    displayHand()   
}

function displayHand() {
    freeze = true;
    const interval = 100
    let time = interval
    for (let i=0; i<hand.length; i++) if (!holds[i]) document.getElementById('card'+i).src="img/Card-Back.png"
    for (let i=0; i<hand.length; i++) {
        if (!holds[i]) {
            if (!gameStarted) hand[i] = deck.draw()
            let imgSrc = "img/"
            switch (hand[i].suit) {
                case "♠":
                    imgSrc+="SPADE-"
                    break
                case "♣":
                    imgSrc+="CLUB-"
                    break
                case "♥":
                    imgSrc+="HEART-"
                    break
                case "♦":
                    imgSrc+="DIAMOND-"
                    break
            }
            imgSrc += VALUE_ORDER[hand[i].value]
            if (VALUE_ORDER[hand[i].value] === 11) imgSrc += "-JACK"
            else if (VALUE_ORDER[hand[i].value] === 12) imgSrc += "-QUEEN"
            else if (VALUE_ORDER[hand[i].value] === 13) imgSrc += "-KING"
            imgSrc += ".png"
            setTimeout(() => {
                document.getElementById('card'+i).src = imgSrc
                if (gameStarted && i===hand.length-1) freeze=false;
            }, time)
            time+=interval
        }
    }
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

function highlightCard(num) {
    document.getElementById('card'+num).style = "box-shadow:0 0 0 1px black, 0 0 0 5px yellow; border-radius: 7px;"
}

function clearHint() {
    for (let i=0; i<hand.length; i++) document.getElementById('card'+i).style = ""
}