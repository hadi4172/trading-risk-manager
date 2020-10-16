window.onload = () => {
    let domSecurityPrice = document.querySelector("#input-price");
    let domOrderSize = document.querySelector("#input-size");
    let domBrokerageFees = document.querySelector("#input-fees");
    let domProfitGoal = document.querySelector("#input-earnings");
    let domMaxLossPerProfit = document.querySelector("#input-maxloss");
    let calculateBtn = document.querySelector("#calculate-btn");
    let domSharesNum = document.querySelector("#sharesnum");
    let domGoalSellPrice = document.querySelector("#maxsellprice");
    let domZeroSellPrice = document.querySelector("#zerosellprice");
    let domMaxLossSellPrice = document.querySelector("#losssellprice");
    let domGoalProfitsPercentage = document.querySelector("#maxprofitpercentage");
    let domMaxLossValue = document.querySelector("#maxlossval");
    let domGainsStep = document.querySelector("#gainsstep");
    let domGapProfitLoss = document.querySelector("#gapprofitloss");

    let inputValuesPerChannel = [[], [], []]; //every sub array contains the values of the 5 input entries
    let outputValuesPerChannel = [[], [], []];
    let currentChannel = 1;

    function initialisation() {
        chrome.storage.sync.get(['inputValuesPerChannel', 'outputValuesPerChannel', 'currentChannel'], function (arg) {
            if (typeof arg.inputValuesPerChannel !== 'undefined') {
                inputValuesPerChannel = arg.inputValuesPerChannel;
                displayInput();
            }
            if (typeof arg.outputValuesPerChannel !== 'undefined') {
                outputValuesPerChannel = arg.outputValuesPerChannel;
                displayOutput();
            }
            if (typeof arg.currentChannel !== 'undefined') {
                currentChannel = arg.currentChannel;
                document.querySelector(`#chan${arg.currentChannel}`).setAttribute("checked","checked");
                changeCurrentChannel(arg.currentChannel);
            } else {
                document.querySelector(`#chan1`).setAttribute("checked","checked");
            }
        });
    }

    initialisation();

    for (let channel of document.querySelectorAll("input[type='radio']")) {
        channel.addEventListener('click', function () {
            changeCurrentChannel(parseInt(channel.getAttribute("id").slice(-1)));
        });
    }

    for (let input of document.querySelectorAll("input[type='number']")) {
        input.addEventListener('click', function () {
            if (currentChannel===3) {
                window.setTimeout(() => {
                    input.select();
                }, 0);
            }
        });
    }

    calculateBtn.addEventListener("click", () => {
        let decimalsOfPrice = countDecimals(domSecurityPrice.value);
        inputValuesPerChannel[currentChannel - 1] = [domSecurityPrice.value, domOrderSize.value, domBrokerageFees.value, domProfitGoal.value, domMaxLossPerProfit.value];
        let orderInShares = roundTo(parseFloat(domOrderSize.value) / parseFloat(domSecurityPrice.value), 0);
        let totalProfitsSellPrice = roundTo((parseFloat(domOrderSize.value) + parseFloat(domProfitGoal.value) + parseFloat(domBrokerageFees.value)) / orderInShares, decimalsOfPrice);
        let zeroLossSellPrice = roundTo((parseFloat(domOrderSize.value) + 0 + parseFloat(domBrokerageFees.value)) / orderInShares, decimalsOfPrice, true);
        let maxLossValue = roundTo(parseFloat(domProfitGoal.value) * (parseFloat(domMaxLossPerProfit.value) / 100));
        let maxLossSellPrice = roundTo((parseFloat(domOrderSize.value) - maxLossValue + parseFloat(domBrokerageFees.value)) / orderInShares, decimalsOfPrice);
        let totalProfitPercentage = roundTo((parseFloat(domProfitGoal.value) / parseFloat(domOrderSize.value)) * 100);
        let gainsStep = roundTo((1 / Math.pow(10, decimalsOfPrice)) * orderInShares, 3);
        let gapBetweenPriceProfitAndLoss = roundTo((totalProfitsSellPrice - maxLossSellPrice) / 5, decimalsOfPrice);
        outputValuesPerChannel[currentChannel - 1] = [
            orderInShares,
            totalProfitsSellPrice.toFixed(decimalsOfPrice),
            zeroLossSellPrice.toFixed(decimalsOfPrice),
            maxLossSellPrice.toFixed(decimalsOfPrice),
            totalProfitPercentage.toFixed(2),
            maxLossValue.toFixed(2),
            gainsStep.toFixed(3)+` / ${(1 / Math.pow(10, decimalsOfPrice))}`,
            gapBetweenPriceProfitAndLoss.toFixed(decimalsOfPrice)
        ];
        displayOutput();
        saveValues();
    });

    function changeCurrentChannel(destination) {
        currentChannel=destination;
        saveValues();
        displayOutput();
        displayInput();
    }

    function displayOutput() {
        for (let i = 0,
            array = [
                domSharesNum,
                domGoalSellPrice,
                domZeroSellPrice,
                domMaxLossSellPrice,
                domGoalProfitsPercentage,
                domMaxLossValue,
                domGainsStep,
                domGapProfitLoss
            ], length = array.length; i < length; i++) {
            array[i].innerHTML = typeof outputValuesPerChannel[currentChannel - 1][i] !== "undefined" ? outputValuesPerChannel[currentChannel - 1][i] : "-";
        }
    }

    function displayInput() {
        for (let i = 0,
            array = [
                domSecurityPrice,
                domOrderSize,
                domBrokerageFees,
                domProfitGoal,
                domMaxLossPerProfit
            ], length = array.length; i < length; i++) {
            array[i].value = inputValuesPerChannel[currentChannel - 1][i];
        }
    }

    function saveValues() {
        chrome.storage.sync.set({
            inputValuesPerChannel: inputValuesPerChannel,
            outputValuesPerChannel: outputValuesPerChannel,
            currentChannel: currentChannel
        });
    }

    function roundTo(num, decimals = 2, ceil = false) {
        return !ceil ?
            Math.round((num + Number.EPSILON) * Math.pow(10, decimals)) / Math.pow(10, decimals) :
            Math.ceil((num + Number.EPSILON) * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }

    function countDecimals(value) {
        if (Math.floor(parseFloat(value)) === parseFloat(value)) return 0;
        return value.split(".")[1].length || 0;
    }
}