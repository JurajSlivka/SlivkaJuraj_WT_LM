//an array, defining the routes
export default[

    {
        //the part after '#' in the url (so-called fragment):
        hash:"welcome",
        ///id of the target html element:
        target:"articles",
        //the function that returns content to be rendered to the target html element:
        getTemplate:creatHtml4welcome
    },
    {
        hash:"articles",
        target:"articles",
        getTemplate: fetchAndDisplayArticles
    },
    {
        hash:"opinions",
        target:"articles",
        getTemplate: createHtml4opinions
    },
    {
        hash:"addOpinion",
        target:"articles",
        getTemplate: createHtml4addOpinion
    },
    {
        hash:"article",
        target:"articles",
        getTemplate: fetchAndDisplayArticleDetail
    },
    {
        hash:"commSend",
        target:"articles",
        getTemplate: addNewAComment
    },
    {
        hash:"artEdit",
        target:"articles",
        getTemplate: editArticle
    },
    {
        hash:"artDelete",
        target:"articles",
        getTemplate: deleteArticle
    },
    {
        hash:"artInsert",
        target:"articles",
        getTemplate: insertArticle
    }
];

const urlBase = "https://wt.kpi.fei.tuke.sk/api";
const articlesPerPage = 20;

function insertArticle(targetElm){
    document.getElementById(targetElm).innerHTML = document.getElementById("template-addArticle").innerHTML;
    document.getElementsByClassName("active")[0].className = "";
    document.getElementById("insert").className = "active";
    const articlesElm2 = document.getElementById("footer");
    articlesElm2.innerHTML=document.getElementById("template-footer").innerHTML;
}

function createHtml4addOpinion(targetElm) {
    document.getElementById(targetElm).innerHTML = document.getElementById("template-addOpinion").innerHTML;
    const articlesElm2 = document.getElementById("footer");
    articlesElm2.innerHTML=document.getElementById("template-footer").innerHTML;
}

function creatHtml4welcome(targetElm) {
    document.getElementById(targetElm).innerHTML = document.getElementById("template-welcome").innerHTML;
    const articlesElm2 = document.getElementById("footer");
    articlesElm2.innerHTML=document.getElementById("template-footer").innerHTML;
}

function createHtml4opinions(targetElm){
    const opinionsFromStorage=localStorage.myTreesComments;
    let opinions=[];

    if(opinionsFromStorage){
        opinions=JSON.parse(opinionsFromStorage);
        opinions.forEach(opinion => {
            opinion.created = (new Date(opinion.created)).toDateString();
        });
    }

    document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-opinions").innerHTML,
        opinions
    );

    const articlesElm2 = document.getElementById("footer");
    articlesElm2.innerHTML=document.getElementById("template-footer").innerHTML;
}


function fetchAndDisplayArticles(targetElm, offsetFromHash, totalCountFromHash){

    let articleList =[];
    let totalCountFromMeta;
    let offsetFromMeta;

    const offset=Number(offsetFromHash);
    const totalCount=Number(totalCountFromHash);

    let tmpHtmlElm2CreatePreview = document.createElement("div");
    let urlQuery = "";
    const previewStringLenght=20;

    if (offset && totalCount){
        urlQuery=`?tag=DuriRulez&offset=${offset}&max=${articlesPerPage}`;
        // urlQuery=`?offset=${offset}&max=${articlesPerPage}`;
    }else{
        urlQuery=`?max=${articlesPerPage}`;
    }

    const url = `${urlBase}/article${urlQuery}`;

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else { //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {
            addArtDetailLink2ResponseJson(responseJSON);
            articleList = responseJSON.articles;
            totalCountFromMeta = Number(responseJSON.meta.totalCount);
            offsetFromMeta = Number(responseJSON.meta.offset);
            return Promise.resolve();

        })
        .then(() => {
            let prrt;
            let cntRequests = articleList.map(
                article => fetch(`${urlBase}/article/${article.id}`)
            );
            return Promise.all(cntRequests);
        })
        .then(responses => {
            let failed = "";
            for (let response of responses) {
                if (!response.ok) {
                    failed += response.url + " ";
                }
            }
            if (failed === "") {
                return responses;
            } else {
                return Promise.reject(new Error(`Failed to access the content of the articles with urls ${failed}`))
            }

        })
        .then(responses => Promise.all(responses.map(resp => resp.json())))
        .then(articles => {
            articles.forEach((article,index) =>{

                //create the content preview string and add it to the article object in the articleList
                tmpHtmlElm2CreatePreview.innerHTML=article.content;
                articleList[index].contentPrev=tmpHtmlElm2CreatePreview.textContent.substring(0,previewStringLenght)+"...";
                articleList[index].totalCount=totalCountFromMeta-1;
                articleList[index].currPage=index+offsetFromMeta;
                articleList[index].range=offsetFromMeta;
                articleList[index].range=offsetFromMeta;
                if(offsetFromMeta>20){
                    articleList[index].prevPage=offsetFromMeta-20;
                }
                if(offsetFromMeta+20<totalCountFromMeta){
                    articleList[index].nextPage=offsetFromMeta+20;
                }

            });
            console.log(JSON.parse(JSON.stringify(articleList)));
            return Promise.resolve()
        })
        .then(() => {
            renderArticles(targetElm, articleList); // funkcia pre vpisanie do sablony...
        })
        .catch(error => { ////here we process all the failed promises
            const errMsgObj = {errMessage: error};
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        });
}

function renderArticles(targetElm, articles) {
    const articlesElm = document.getElementById("articles");
    articlesElm.innerHTML=Mustache.render(document.getElementById("template-articles").innerHTML, articles);
    if(articles.length!=0) {
        const articlesElm2 = document.getElementById("footer");
        articlesElm2.innerHTML = Mustache.render(document.getElementById("template-footer-preklik").innerHTML, articles[articles.length - 1]);
    }
}

function addArtDetailLink2ResponseJson(responseJSON){
    responseJSON.articles =
        responseJSON.articles.map(
            article =>(
                {
                    ...article,
                    detailLink:`#article/${article.id}/${responseJSON.meta.offset}/${responseJSON.meta.totalCount}`
                }
            )
        );
}

function fetchAndDisplayArticleDetail(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    fetchAndProcessArticle(...arguments,false);
}



function editArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    fetchAndProcessArticle(...arguments,true);
}

function fetchAndProcessArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash,forEdit) {
    const url = `${urlBase}/article/${artIdFromHash}`;
    let clanok;
    fetch(url)
        .then(response =>{
            if(response.ok){
                return response.json();
            }else{ //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {
            if(forEdit){
                responseJSON.formTitle="Article \"" + responseJSON.title + "\" - edit";
                responseJSON.formSubmitCall = `processArtEditFrmData(event,${artIdFromHash},${offsetFromHash},${totalCountFromHash},'${urlBase}')`;
                responseJSON.submitBtTitle="Save article";
                responseJSON.urlBase=urlBase;
                responseJSON.backLink=`#article/${artIdFromHash}/${offsetFromHash}/${totalCountFromHash}`;
                console.log(responseJSON);
                if(responseJSON.tags){
                    let idx = responseJSON.tags.indexOf(",DuriRulez");
                    console.log(idx);
                    if(idx > -1) responseJSON.tags.splice(idx, 1);
                }
                document.getElementById(targetElm).innerHTML =
                    Mustache.render(
                        document.getElementById("template-article-form").innerHTML,
                        responseJSON
                    );
                const articlesElm2 = document.getElementById("footer");
                articlesElm2.innerHTML=document.getElementById("template-footer").innerHTML;
                clanok = responseJSON;
            }else{
                responseJSON.backLink=`#articles/${offsetFromHash}/${totalCountFromHash}`;
                responseJSON.editLink=`#artEdit/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;
                responseJSON.addCommLink=`#commSend/${responseJSON.id}`;
                responseJSON.deleteLink=`#artDelete/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;
                clanok = responseJSON;
            }
        })
        .then( () => {
            return fetch(`${url}/comment`)
        })
        .then(response =>{
            if(response.ok){
                return response.json();
            }else{ //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then((responseJSON) => {
            clanok.comments = responseJSON.comments;
            if(!forEdit) {
                document.getElementById(targetElm).innerHTML =
                    Mustache.render(
                        document.getElementById("template-article").innerHTML,
                        clanok
                    );
                updateSignIn();
                const articlesElm2 = document.getElementById("footer");
                articlesElm2.innerHTML=document.getElementById("template-footer").innerHTML;
            }
        })
        .catch (error => { ////here we process all the failed promises
            const errMsgObj = {errMessage:error};
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        });
}

function deleteArticle(targetElm, artIdFromHash) {
    const deleteReqSettings =
        {
            method: 'DELETE'
        };
    document.getElementById(targetElm).innerHTML=`<p>Attempting to delete article with id=${artIdFromHash}<br />... <br /> <br /></p>`;
    fetch(`${urlBase}/article/${artIdFromHash}`, deleteReqSettings)  //now we need the second parameter, an object wih settings of the request.
        .then(response => {      //fetch promise fullfilled (operation completed successfully)
            if (response.ok) {    //successful execution includes an error response from the server. So we have to check the return status of the response here.
                window.alert("Article successfully deleted."); //no response this time, so we end here
                window.location.hash=`#welcome`;
            } else { //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`)); //we return a rejected promise to be catched later
            }
        })
        .catch(error => { ////here we process all the failed promises
            outpElm.innerHTML+=`Attempt failed. Details: <br />  ${error}`;
        });
}

function addNewAComment(targetElm, artIdFromHash) {
    const newCommData = {
        text: document.getElementById("commentAdd").value.trim(),
        author: document.getElementById("commentAuthor").value.trim(),
    };

    if (!(newCommData.text && newCommData.author)) {
        window.alert("Please, enter article title and content");
        return;
    }
    const postReqSettings = //an object wih settings of the request
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify(newCommData)
        };
    fetch(`${urlBase}/article/${artIdFromHash}/comment`, postReqSettings)  //now we need the second parameter, an object wih settings of the request.
        .then(response => {      //fetch promise fullfilled (operation completed successfully)
            if (response.ok) {    //successful execution includes an error response from the server. So we have to check the return status of the response here.
                return response.json(); //we return a new promise with the response data in JSON to be processed
            } else { //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`)); //we return a rejected promise to be catched later
            }
        })
        .then(responseJSON => { //here we process the returned response data in JSON ...
            window.location.hash=`#article/${artIdFromHash}`;
        })
        .catch(error => { ////here we process all the failed promises
            window.alert("Error adding comment to the server!");
            window.location.hash=`#article/${artIdFromHash}`;
        });
}
