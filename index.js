#!/usr/bin/env node

import chalk from "chalk"
import chalkAnimation from "chalk-animation";
import inquirer from "inquirer";
import Math from "Math";
import { createSpinner } from "nanospinner";


// global variables
let PlayerName = "Guest"
let RandomNumber = 0;
let GameRounds = 1
let DifficultyLevel = 1
let MaxAttempts = 10
let AnotherRound = false


const sleep = (ms=2000) => new Promise((r) => setTimeout(r,ms))

function GetRandomInt(min, max) {
    min = Math.floor(min)
    max = Math.ceil(max);
    const number = Math.floor(Math.random() * (max - min + 1) + min);
    return  number
}

async function AskForPlayerName() {
    const Ans = await inquirer.prompt({
        name:"player_name",
        type: 'input',
        message: "What is Your Name?",
        default () {
            return 'Guest'
        }
    });
    PlayerName = Ans.player_name
}

async function AskPlayerToChooseNumber() {
    const PlayerChoosenNumber = await inquirer.prompt({
        name: "Guessed_Number",
        type:"input",
        message: "Your Guessed Number?",
    });
    return PlayerChoosenNumber.Guessed_Number
}

async function AskForAnotherRound() {
    const AnotherRoundPrompt =  await inquirer.prompt({
        name:"AnotherRound",
        type: "input",
        message:"Do You Want To Play Another Round?(Yes or No)",
        default(){
            return false
        }
    });
    const AnotherRound = AnotherRoundPrompt.AnotherRound
    return((AnotherRound == true || AnotherRound == 'y' || AnotherRound == 'yes' || AnotherRound == 'Y')? true:false)
     
}

function SetDifficultyLevel(Choise){
    DifficultyLevel = Choise.level.split('.')[0]
    MaxAttempts = AttemptsForCurrentLevel()
}

async function AskDifficulty () {
    await inquirer.prompt({
        name: "level",
        type:"list",
        message:"Choose Difficulty level",
        choices:
        [
            "1.Eesy (10 chances)",
            "2.Mid (5)" ,
            "3.diffecult(3)",
            "4.Extreme(1)"
        ]
    }).then(ans => {
        const difficulty = ans.level.split('.')[1]
        console.log(chalk.red(`\n\tdifficulty set at ${difficulty}`))
        SetDifficultyLevel(ans)
    })
}

function IsCorrectAns(Ans) {
    return Ans == RandomNumber? true:false
}

function HintMessage(Ans){

    if(isNaN(Ans))
        return "The Guess Must Be a Valid Number"

    if (Ans > RandomNumber)
        return `THe Number Is Less Than ${Ans}`
    else {
        return `The Number Is Greater Than ${Ans}`
    }
}

async function HandleAns() {

    let RemainingAttempts = MaxAttempts
    while(RemainingAttempts > 0){
        RemainingAttempts -= 1

        const PlayerChoosenNumber = await AskPlayerToChooseNumber();
        const CheckingAnsSpinner = createSpinner('Checking Your Answer ....').start()
        await sleep();

        const AnsCorrect = IsCorrectAns(PlayerChoosenNumber);

        if(AnsCorrect){
            CheckingAnsSpinner.success({
                text:"Congrats Your Guessed Number is Right."
            });
            AnotherRound = await AskForAnotherRound()
            if(AnotherRound)
                GameRounds += 1
            break;
        } else {
            if(RemainingAttempts > 0) {
                CheckingAnsSpinner.error({
                    text: `Bad Luck ${HintMessage(PlayerChoosenNumber)}`
                });
            } else {
                CheckingAnsSpinner.error({
                    text: `Sorry You Lost The Number was ${RandomNumber}`
                });
                AnotherRound = await AskForAnotherRound()
                if(!AnotherRound){
                    process.exit(1);
                }
                GameRounds += 1
            }

        }

    }

}

async function StartNewRoundSpinner(Round) {
    const RoundSpinner = createSpinner(`Starting Round ${Round} ...`).start();

    await sleep(5000);

    RoundSpinner.success({
        text: "Round Started"
    })
}

async function Greating(Name="Guest") {
    // Show Greating Mess
    const GreatingMessageTitle = chalkAnimation.rainbow(`Hi ${PlayerName} Welcome to Number Guessing Game`);
    await sleep();
    GreatingMessageTitle.stop();


}

function AttemptsForCurrentLevel(){
    if(DifficultyLevel == 1)
        return 10
    else if(DifficultyLevel == 2)
        return 5
    else if(DifficultyLevel == 3)
        return 3
    else if(DifficultyLevel == 4)
        return 1
}

async function ShowGameRules() {
    const Attempts = AttemptsForCurrentLevel()
    console.log(`
    ${chalk.bgBlue.black("Game Rules:")}
    I'm thinking of a number between 1 and 100.
    ${chalk.green('1.Try to guess a number between 1 - 100 (inclusive)')}
    ${chalk.green(`2. You have ${Attempts} attempts only to get the number right`)}
    `);
}

async function StartTheGame() {
    await AskForPlayerName();
    await Greating();
    await AskDifficulty();
    await ShowGameRules();
    let round = 1;

    while(GameRounds >= round){

        RandomNumber = GetRandomInt(1,100);
        await StartNewRoundSpinner(round);
        await HandleAns();

        round += 1

    }
    
}

(async () => {
    await StartTheGame();
})()
