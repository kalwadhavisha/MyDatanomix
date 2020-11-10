const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const morgan = require("morgan");
const CompanyOverview = require("./models/setting-schema");
var numeral = require("numeral");
var moment = require("moment");
let ejs = require("ejs");
const path = require("path");
const nodemailer = require("nodemailer");
const { db } = require("./models/setting-schema");
const { Console } = require("console");
const app = express();
const ejsLint = require("ejs-lint");
var autocomplete = require("autocompleter");
const { userInfo } = require("os");
var pjax = require("express-pjax");

app.use(express.static("public"));
app.use(morgan("dev"));

const apiKey = "TBFKVIJZT7IK5VTB";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "ejs");
moment.suppressDeprecationWarnings = true;

var compDesc = [
	{
		header: "Market Capitalization",
		headerDesc:
			"Total number of outstanding shares multiplied by the current market price of the stock.",
	},
	{
		header: "Gross Profit",
		headerDesc:
			"It is the total profit of a company calculated by Revenue minus the costs associated with making and selling its products or providing services.",
	},
	{
		header: "Revenue",
		headerDesc:
			"It is the total amount of income generated by a company by selling its products or services. Also known as top line or gross sales. ",
	},
	{
		header: "EBITDA",
		headerDesc:
			"It is the net income or earnings with interest, taxes, depreciation and amortization added back. It eliminates the effects of financing and capital expenditures hence, can be used to analyse and compare profitability.",
	},
	{
		header: "PE Ratio",
		headerDesc:
			"It is the ratio of a company's share price to the company's Earnings Per Share (EPS). Higher PE Ratio indicates an overvalued company.",
	},
	{
		header: "PEG Ratio",
		headerDesc:
			"It is the ratio of a company's PE Ratio to the company's expected Rate of Growth. PEG Ratios greater than 1 indicate an overvalued stock.",
	},
	{
		header: "Book Value",
		headerDesc:
			"It is the total value of the company's assets minus the company's outstanding liabilities. If a stock trades below the book value, it is an opportunity to buy the company's assets at less than they are worth.",
	},
	{
		header: "Earnings Per Share",
		headerDesc:
			"It is the total profit of a company divided by the outstanding shares of its common stock. Higher the EPS, more profitable the company is.",
	},
	{
		header: "Diluted EPS",
		headerDesc:
			"It is used to gauge the quality of a company's EPS if all convertible securities were exercised. Diluted EPS tends to be lower than EPS.",
	},
	{
		header: "Revenue Per Share",
		headerDesc:
			"It is the total revenue earned per share divided by the total shares outstanding over a designated period, quarterly, semi-annually or Trailing Twelve Months (TTM). Also known as Sales Per Share",
	},
	{
		header: "Profit Margin",
		headerDesc:
			"It represents profits generated for each dollar of sale. Higher profit margins are indicators of a company's financial health, management skills and growth potential. ",
	},
	{
		header: "Operating Margin",
		headerDesc:
			"It is the total profit of a company makes on every dollar of sales after paying for variale costs of production, wages, materials etc, but before paying interest or tax. Increasing operating margin indicates a company whose profitability is improving over time.",
	},
	{
		header: "Return on Assets",
		headerDesc:
			"It is calculated by dividing net income by total assets. It is an indicator of how well a company utilizes its assets and how profitable a company is relative to its total assets. Higher ROA indicates more asset efficiency.",
	},
	{
		header: "Return on Equity",
		headerDesc:
			"It is calculated by dividing net income by shareholders' equity. It is an indicator of profitability of a company in relation to stockholders' equity. ROE greater than 0.14 (Long term avg. of S&P 500) is an ideal ratio.",
	},
	{
		header: "Quarterly Earnings Growth YoY",
		headerDesc:
			"It is the company's earnings growth of the current quarter as compared to the same quarter one year ago. It indicates the earnings growth of the company over time.",
	},
	{
		header: "Quarterly Revenue Growth YoY",
		headerDesc:
			"It is the company's revenue growth of the current quarter as compared to the same quarter one year ago. It indicates the growth of the company's sales over time.",
	},
	{
		header: "Price to Sales Ratio",
		headerDesc:
			"It is the company's market capitalization divided by the company's total sales or revenue over the past 12 months. Low P/S ratios can indicate unrecognized value potential as long as the company has high profit margins, low debt levels and high growth prospects. ",
	},
	{
		header: "Price to Book Ratio",
		headerDesc:
			"It is used to compare a company's market capitalization to its books value. Obtained by dividing company's stock per share by its book value per share. Also known as price-equity ratio. P/B ratios under 1 can indicate solid investments as long as the company has high profit margins, low debt levels and high growth prospects.",
	},
	{
		header: "EV to Revenue",
		headerDesc:
			"It is the measure of the value of a stock that compares a company's enterprise value to its revenue. Often used to determine a company's valuation in the case of a potential acquisition.",
	},
	{
		header: "EV to EBITDA",
		headerDesc:
			"It is a metric used as a valuation tool to compare the value of a company, debt included, to the company’s cash earnings minus non-cash expenses. It strips out debt costs, taxes, appreciation, and amortization, thereby providing a clearer picture of the company's financial performance. EV/EBITDA values below 10 are seen as healthy but varies within sectors. ",
	},
	{
		header: "Beta Value",
		headerDesc:
			"It is a numeric value that measures the fluctuations of a stock to changes in the overall stock market. Beta value of 1.5 indicates 50% greater volatility than the market.",
	},
	{
		header: "Short Ratio",
		headerDesc:
			"It gives you an insight into how a company's stock price is likely to move. Lower short ratio indicates improved investor sentiments and good chance of stock price going up.",
	},
	{
		header: "Short Percentage Outstanding",
		headerDesc:
			"It is the number of shorted shares divided by the number of shares outstanding. Higher ratios indicate pessimistic investor sentiment.",
	},
	{
		header: "Short Percentage Float",
		headerDesc:
			"It is the number of shares shorted by institutional traders divided by the number of shares outstanding. Institutional traders are first to sell when the markets are at peak hence this ratio is the key to understand institutions behavior.",
	},
	{
		header: "Insiders Percentage",
		headerDesc:
			"It is the percentage of shares held by insiders/individuals of the total outstanding shares.",
	},
	{
		header: "Institutions Percentage",
		headerDesc:
			"It is the percentage of shares held by institutions of the total outstanding shares.",
	},
	{
		header: "Payout Ratio",
		headerDesc:
			"It is the proportion of earnings a company pays shareholders in the form of dividends, expressed as a ratio of company's total earnings. Total dividends divided by net income.",
	},
	{
		header: "Dividend Yield",
		headerDesc:
			"It is the ratio of annual dividends per share divided by its current stock price. About 0.04 to 0.06 is a good dividend yield",
	},
	{
		header: "Dividend Per Share",
		headerDesc:
			"It is the total dividends paid out over a period divided by shares outstanding. Higher Dividends per share indicate strong company performance.",
	},
	{
		header: "Forward Annual Dividend Yield",
		headerDesc: "It is the ratio of a company's annual dividend compared to its share price.",
	},
	{
		header: "Forward Annual Dividend Rate",
		headerDesc:
			"It is is expressed as a dollar figure and is the combined total of dividend payments expected. Also used interchangably with dividend yield.",
	},
];

const dbURL =
	"mongodb+srv://MadhuHavisha:Mishi1234@cluster0.8etrz.mongodb.net/mydatanomixDB?retryWrites=true&w=majority";

mongoose
	.connect(dbURL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then((resultDB) =>
		app.listen(80, function () {
			console.log("App listening on port 80!");
		})
	)
	.catch((err) => console.log(err));

app.get("/", function (req, res) {
	res.render("index", {
		companyName: null,
		companyTicker: null,
		companySector: null,
		companyIndustry: null,
		companyHQ: null,
		companyTrailingPE: null,
		companyForwardPE: null,
		companyAssetType: null,
		companyExchange: null,
		companyLatestQuarter: null,
		companyPERatio: null,
		companyPEGRatio: null,
		companyPriceToSales: null,
		companyPriceToBook: null,
		companyEVToRevenue: null,
		companyEVTOEBITDA: null,
		companyMarketCap: null,
		companyEBITDA: null,
		companyBookValue: null,
		companyRevenuePerShare: null,
		companyProfitMargin: null,
		companyOperatingMargin: null,
		companyReturnOnAssets: null,
		companyReturnOnEquity: null,
		companyRevenue: null,
		companyGrossProfit: null,
		companyDilutedEPS: null,
		companyQuarterlyEarningsYOY: null,
		companyQuarterlyRevenueYOY: null,
		companyBeta: null,
		companySharesOutstanding: null,
		companySharesFloat: null,
		companySharesShort: null,
		companySharesShortPriorMonth: null,
		companyShortRatio: null,
		companyShortPercentOutstanding: null,
		companyShortPercentFloat: null,
		companyPercentInsiders: null,
		companyPercentInstitutions: null,
		companyForwardAnnualDividendRate: null,
		companyForwardAnnualDividendYield: null,
		companyPayoutRatio: null,
		companyDividendDate: null,
		companyExDividendDate: null,
		companyLastSplitFactor: null,
		companyLastSplitDate: null,
		companyDividendPerShare: null,
		companyDividendYield: null,
	});
	console.log("In get");
});

app.get("/viz-page", function (req, res) {
	CompanyOverview.find({}, { Symbol: 1, Name: 1, MarketCapitalization: 1 })
		.sort({
			MarketCapitalization: -1,
		})
		.then((result) => {
			var names = result.map((i) => i.Name);
			var symbols = result.map((i) => i.Symbol);
			var marketCap = result.map((i) => parseFloat(i.MarketCapitalization));
			//console.log(names);
			//console.log(symbols);
			//console.log(marketCap);
			res.render("visualization", {
				compSymbols: symbols,
				compLongNames: names,
				compDataVal: marketCap,
			});
		});
});

app.post("/viz-page", function (req, res) {
	//console.log("Data Receiverd Printed  ***************************");
	console.log(req.body.name);
	var subs = req.body.name;
	var desc = req.body.desc;
	var dbQueryFind = { Symbol: 1, Name: 1 };
	dbQueryFind[subs] = 1;
	var dbQuerySort = {};
	dbQuerySort[subs] = -1;
	function getHeaderAndDesc(desc) {
		for (i = 0; i < compDesc.length; i++) {
			if (compDesc[i].header === desc) {
				return compDesc[i];
			}
		}
	}

	CompanyOverview.find({}, dbQueryFind)
		.sort(dbQuerySort)
		.then((result) => {
			var names = result.map((i) => i.Name);
			var symbols = result.map((i) => i.Symbol);
			var paramValue = result.map((i) => parseFloat(i[subs]));
			var headerAndDesc = getHeaderAndDesc(desc);
			console.log("Logging company header and description: ");

			//console.log("DATABASE OUTPUT: ");
			//console.log(result);
			//console.log(names);
			//console.log(symbols);
			//console.log(paramValue);

			res.json({
				compSymbols: symbols,
				compLongNames: names,
				compDataVal: paramValue,
				compDisplayHeader: headerAndDesc.header,
				compDisplayDesc: headerAndDesc.headerDesc,
			});
		});
});

app.get("/autocomplete/", function (req, res, next) {
	var reqInfo = new RegExp(req.query["term"], "i");
	console.log("Rx data from autocomplete:");
	console.log(reqInfo);

	var compFilter = CompanyOverview.find({ Name: reqInfo }, { Name: 1, Symbol: 1 }).limit(10);
	compFilter.exec(function (err, data) {
		console.log("Data to be sent:");
		console.log(data);
		var result = [];
		if (!err) {
			if (data && data.length && data.length > 0) {
				data.forEach((comp) => {
					let obj = {
						id: comp._id,
						label: comp.Name,
						sym: comp.Symbol,
					};
					result.push(obj);
				});
			}
		}
		console.log("Logging result: --------");
		console.log(result);
		res.jsonp(result);
	});
});

app.get("/company-search", function (req, res) {
	res.render("index", {
		companyName: null,
		companyTicker: null,
		companySector: null,
		companyIndustry: null,
		companyHQ: null,
		companyTrailingPE: null,
		companyForwardPE: null,
		companyAssetType: null,
		companyExchange: null,
		companyLatestQuarter: null,
		companyPERatio: null,
		companyPEGRatio: null,
		companyPriceToSales: null,
		companyPriceToBook: null,
		companyEVToRevenue: null,
		companyEVTOEBITDA: null,
		companyMarketCap: null,
		companyEBITDA: null,
		companyBookValue: null,
		companyRevenuePerShare: null,
		companyProfitMargin: null,
		companyOperatingMargin: null,
		companyReturnOnAssets: null,
		companyReturnOnEquity: null,
		companyRevenue: null,
		companyGrossProfit: null,
		companyDilutedEPS: null,
		companyQuarterlyEarningsYOY: null,
		companyQuarterlyRevenueYOY: null,
		companyBeta: null,
		companySharesOutstanding: null,
		companySharesFloat: null,
		companySharesShort: null,
		companySharesShortPriorMonth: null,
		companyShortRatio: null,
		companyShortPercentOutstanding: null,
		companyShortPercentFloat: null,
		companyPercentInsiders: null,
		companyPercentInstitutions: null,
		companyForwardAnnualDividendRate: null,
		companyForwardAnnualDividendYield: null,
		companyPayoutRatio: null,
		companyDividendDate: null,
		companyExDividendDate: null,
		companyLastSplitFactor: null,
		companyLastSplitDate: null,
		companyDividendPerShare: null,
		companyDividendYield: null,
	});
	//console.log("In get");
});

app.post("/company-search", function (req, res) {
	console.log("In post");
	const compName = req.body.data;
	console.log(compName);
	console.log({ Name: compName });
	CompanyOverview.find({ Name: compName })
		.then((result) => {
			res.json({
				companyName: result[0].Name,
				companyTicker: result[0].Symbol,
				companySector: result[0].Sector,
				companyIndustry: result[0].Industry,
				companyHQ: result[0].Address,
				companyTrailingPE: result[0].TrailingPE,
				companyForwardPE: result[0].ForwardPE,
				companyAssetType: result[0].AssetType,
				companyExchange: result[0].Exchange,
				companyLatestQuarter: moment(result[0].LatestQuarter).format("LL"),
				companyPERatio: result[0].PERatio,
				companyPEGRatio: result[0].PEGRatio,
				companyPriceToSales: result[0].PriceToSalesRatioTTM,
				companyPriceToBook: result[0].PriceToBookRatio,
				companyEVToRevenue: result[0].EVToRevenue,
				companyEVTOEBITDA: result[0].EVToEBITDA,
				companyMarketCap: numeral(result[0].MarketCapitalization)
					.format("(0.000 a)")
					.toUpperCase(),
				companyEBITDA: numeral(result[0].EBITDA).format("(0.000 a)").toUpperCase(),
				companyBookValue: result[0].BookValue,
				companyEPS: result[0].EPS,
				companyRevenuePerShare: parseFloat(result[0].RevenuePerShareTTM),
				companyProfitMargin: numeral(result[0].ProfitMargin).format("(0.000 %)"),
				companyOperatingMargin: numeral(result[0].OperatingMarginTTM).format("(0.000 %)"),
				companyReturnOnAssets: numeral(result[0].ReturnOnAssetsTTM).format("(0.000 %)"),
				companyReturnOnEquity: numeral(result[0].ReturnOnEquityTTM).format("(0.000 %)"),
				companyRevenue: numeral(result[0].RevenueTTM).format("(0.000 a)").toUpperCase(),
				companyGrossProfit: numeral(result[0].GrossProfitTTM)
					.format("(0.000 a)")
					.toUpperCase(),
				companyDilutedEPS: result[0].DilutedEPSTTM,
				companyQuarterlyEarningsYOY: numeral(result[0].QuarterlyEarningsGrowthYOY).format(
					"0.000 %"
				),
				companyQuarterlyRevenueYOY: numeral(result[0].QuarterlyRevenueGrowthYOY).format(
					"0.000 %"
				),
				companyBeta: result[0].Beta,
				companySharesOutstanding: numeral(result[0].SharesOutstanding)
					.format("(0.000 a)")
					.toUpperCase(),
				companySharesFloat: numeral(result[0].SharesFloat)
					.format("(0.000 a)")
					.toUpperCase(),
				companySharesShort: numeral(result[0].SharesShort)
					.format("(0.000 a)")
					.toUpperCase(),
				companySharesShortPriorMonth: numeral(result[0].SharesShortPriorMonth)
					.format("(0.000 a)")
					.toUpperCase(),
				companyShortRatio: result[0].ShortRatio,
				companyShortPercentOutstanding: numeral(result[0].ShortPercentOutstanding).format(
					"0.000 %"
				),
				companyShortPercentFloat: numeral(result[0].ShortPercentFloat).format("0.000 %"),
				companyPercentInsiders: numeral(result[0].PercentInsiders).format("0.000 %"),
				companyPercentInstitutions: numeral(result[0].PercentInstitutions).format(
					"0.000 %"
				),
				companyForwardAnnualDividendRate: numeral(
					result[0].ForwardAnnualDividendRate
				).format("0.000 %"),
				companyForwardAnnualDividendYield: numeral(
					result[0].ForwardAnnualDividendYield
				).format("0.000 %"),
				companyPayoutRatio: result[0].PayoutRatio,
				companyDividendDate: moment(result[0].DividendDate).format("LL"),
				companyExDividendDate: moment(result[0].ExDividendDate).format("LL"),
				companyLastSplitFactor: result[0].LastSplitFactor,
				companyLastSplitDate: moment(result[0].LastSplitDate).format("LL"),
				companyDividendPerShare: result[0].DividendPerShare,
				companyDividendYield: numeral(result[0].DividendYield).format("0.000 %"),
			});
		})
		.catch((err) => {
			console.log(err);
		});
});
