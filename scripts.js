$(document).ready(function() {
// *********   CHART 1: Hard Coded Bar Graph: Market Cap   ***********

    var ctx = document.getElementById("myChart1").getContext("2d");
    //var width = window.innerWidth || document.body.clientWidth;
    var gradientStroke = ctx.createLinearGradient(500, 0, 100, 0);
    gradientStroke.addColorStop(0,"#185a9d" );
    //gradientStroke.addColorStop(0.5, "#94d973");
    //gradientStroke.addColorStop(0.6, "#fad874");
    gradientStroke.addColorStop(1, "#43cea2");

    var compSymbols = <%- JSON.stringify(compSymbols) %>;
    var compLongNames = <%- JSON.stringify(compLongNames) %>;
    var compDataVal = <%- JSON.stringify(compDataVal) %>;
    console.log(compSymbols);
    var myChart = new Chart(ctx, {
        type: "horizontalBar",
        data: {
            labels: compLongNames,
            longlabels: compSymbols,
            datasets: [
                {
                    label: "Market Capitalization for NASDAQ-100 companies",
                    data: compDataVal,
                    backgroundColor: gradientStroke,
                    borderColor: "rgb(0,0,0)",
                    order: 1,
                    hoverBackgroundColor: gradientStroke,
                    borderWidth: 0.2,
                    hoverBorderWidth: 2,
                },
            ],
        },
        options: {
            layout: {
                padding: {
                    left: 3,
                    right: 10,
                    top: 10,
                    bottom: 30,
                },
            },
            scales: {
                xAxes: [
                    {
                        display: true,
                        position: "top",
                        ticks: {
                            beginAtZero: true,
                            callback: function (value, index, data) {
                                return value < 1000000
                                    ? "" + value + ""
                                    : value < 1000000
                                    ? "$ " + value / 1000 + " K"
                                    : value < 1000000
                                    ? "$ " + value / 1000000 + " M"
                                    : "$ " + value / 1000000000 + " B";
                            },
                        },
                    },
                    
                ],
            },
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {
                        var longlabel = data.longlabels[tooltipItem.index];
                        return longlabel + ": $" + tooltipItem.xLabel;
                    },
                },
            },
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: "linear",
            },
        },
    });



    function ChangeParamsDisplay() {

        var paramSelect = document.getElementById("paramSelect");

        var valToSendApp = paramSelect.options[paramSelect.selectedIndex].value;
        console.log("Value To Send ----------");
        console.log(valToSendApp);
        var dataToSend = {};
        dataToSend.name = valToSendApp;
        console.log("Data To Send ---------");
        console.log(dataToSend);
        var headerText = paramSelect.options[paramSelect.selectedIndex].innerText;
        var compSymbols ;
        var compLongNames ;
        var compDataVal;



        $.ajax({
            url: "/viz-page",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(dataToSend),
            success: function(response) {
                console.log("Response received in Viz.ejs: ");
                console.log(response.compSymbols);
                console.log(response.compLongNames);
                console.log(response.compDataVal);

                var ctx = document.getElementById("myChart1").getContext("2d");

                var compSymbolsNew =  response.compSymbols;
                var compLongNamesNew = response.compLongNames;
                var compDataValNew = response.compDataVal;
                console.log(compSymbolsNew);

                var myChart = new Chart(ctx, {
                    type: "horizontalBar",
                    data: {
                        labels: compLongNamesNew,
                        longlabels: compSymbolsNew,
                        datasets: [
                            {
                                label: ""+headerText+" for NASDAQ-100 companies",
                                data: compDataValNew,
                                backgroundColor: gradientStroke,
                                borderColor: "rgb(0,0,0)",
                                order: 1,
                                hoverBackgroundColor: gradientStroke,
                                borderWidth: 0.2,
                                hoverBorderWidth: 2,
                            },
                        ],
                    },
                    options: {
                        layout: {
                            padding: {
                                left: 3,
                                right: 10,
                                top: 20,
                                bottom: 30,
                            },
                        },
                        scales: {
                            xAxes: [
                                {
                                    display: true,
                                    position: "top",
                                    ticks: {
                                        beginAtZero: true,
                                        callback: function (value, index, data) {
                                            return value < 1000000
                                                ? "" + value + ""
                                                : value < 1000000
                                                ? "$ " + value / 1000 + " K"
                                                : value < 1000000
                                                ? "$ " + value / 1000000 + " M"
                                                : "$ " + value / 1000000000 + " B";
                                        },
                                    },
                                },
                            ],
                        },
                        tooltips: {
                            callbacks: {
                                label: function (tooltipItem, data) {
                                    var longlabel = data.longlabels[tooltipItem.index];
                                    return longlabel + ": $" + tooltipItem.xLabel;
                                },
                            },
                        },
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: {
                            duration: 500,
                            easing: "linear",
                        },
                    },
                });





            }
        })

    };
});