resp.forEach(function(resp){ 
    if(resp.companyName != null) { 
        include('./partials/company-overview.ejs') 
        if(companyPayoutRatio != "0") { 
            include('./partials/dividend.ejs')  
        }  
    } 
)}