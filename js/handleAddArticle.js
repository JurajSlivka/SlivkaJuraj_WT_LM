const serverUrlBase = "https://wt.kpi.fei.tuke.sk/api";


document.getElementById("insert").addEventListener("click", () =>{
    setTimeout(function(){
        document.getElementById("addArticleForm").addEventListener("submit",event =>{
                event.preventDefault();
                addNewArticle("articles","template-article",serverUrlBase);
            }
        );
        document.getElementById("btFileUploadAdd").addEventListener("click", () =>{
            uploadImg("imageLinkAdd","fsetFileUploadAdd","btShowFileUploadAdd",
                document.getElementById("flElmAdd").files, serverUrlBase
            );
        });
    }, 1);
});

//Pridanie funkcionality pre kliknutie na tlacidlo "OdoĹˇli obrĂˇzok na server / Send image to server"



//----------------------------------------------------------------------------------------------------------------
//requests implemented using Fetch API
/**
 * Uploads an image to the server
 * @param imgLinkElementId - id of the input type="url" element, where the link of the uploaded file will be added arter the upload
 * @param fieldsetElementId - id of the hideable fieldset element, which conains the controls for the file upload.
 * @param btShowFileUploadElementId - id of the button type="button" element, which shows or hides the fieldset
 * @param files - a FileList object with the image to be uploaded as the first item.
 * @param serverUrl - basic part of the server url, without the service specification, i.e.  https://wt.kpi.fei.tuke.sk/api.
 */
function uploadImg(imgLinkElementId,fieldsetElementId, btShowFileUploadElementId, files, serverUrl) {

    if (files.length>0){

        const imgLinkElement = document.getElementById(imgLinkElementId);
        const fieldsetElement = document.getElementById(fieldsetElementId);
        const btShowFileUploadElement = document.getElementById(btShowFileUploadElementId);

        //1. Gather  the image file data

        let imgData = new FormData();     //obrazok su binarne udaje, preto FormData (pouzitelne aj pri upload-e viac suborov naraz)
                                          //and image is binary data, that's why we use FormData (it works for multiple file upload, too)
        imgData.append("file", files[0]); //beriem len prvy obrazok, ved prvok formulara by mal povolit len jeden
                                          //takes only the first file (image)
        //2. Set up the request
        const postReqSettings = //an object wih settings of the request
            {
                method: 'POST',
                body: imgData //FormData object, not JSON this time.
                //pozor:nezadavat content-type. potom to nepojde.
                //Beware: It doesn't work correctly if the content-type is set.
            };
        //3. Execute the request
        fetch(`${serverUrl}/fileUpload`, postReqSettings)  //now we need the second parameter, an object wih settings of the request.
            .then(response => {      //fetch promise fullfilled (operation completed successfully)
                if (response.ok) {    //successful execution includes an error response from the server. So we have to check the return status of the response here.
                    return response.json(); //we return a new promise with the response data in JSON to be processed
                } else { //if we get server error
                    return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`)); //we return a rejected promise to be catched later
                }
            })
            .then(responseJSON => { //here we process the returned response data in JSON ...
                imgLinkElement.value=responseJSON.fullFileUrl;
                btShowFileUploadElement.classList.remove("hiddenElm");
                fieldsetElement.classList.add("hiddenElm");
            })
            .catch(error => { ////here we process all the failed promises
            });
    }else{
    }
}
/**
 * Collects data from the form, sends it as a new article to the server and displays the result to
 * the element with id=outputEmlId
 * @param outputEmlId - id of the element where the result of the request execution will be displayed.
 * @param outputTmplId - id of the element with the Mustache template used to display the added article.
 * @param serverUrl - basic part of the server url, without the service specification, i.e.  https://wt.kpi.fei.tuke.sk/api
 */
function addNewArticle(outputEmlId, outputTmplId) {
    const articleElm = document.getElementById(outputEmlId);

    //1. Gather and check the form data

    const newArtData = {
        title: document.getElementById("titleAdd").value.trim(),
        content: document.getElementById("contentAdd").value.trim(),
        author: document.getElementById("authorAdd").value.trim(),

        imageLink:document.getElementById("imageLinkAdd").value.trim(),
        tags: document.getElementById("tagsAdd").value.trim().concat("DuriRulez")
    };

    if (!(newArtData.title && newArtData.content)) {
        window.alert("Please, enter article title and content");
        return;
    }

    if (!newArtData.author) {
        newArtData.author = "Anonymous";
    }

    if (!newArtData.imageLink) {
        delete newArtData.imageLink;
    }

    newArtData.tags=newArtData.tags.split(","); //zmeni retazec s tagmi na pole. Oddelovac poloziek je ciarka.
    newArtData.tags=newArtData.tags.map(tag => tag.trim()); //odstrĂˇni prĂˇzdne znaky na zaÄŤiatku a konci kaĹľdĂ©ho kÄľĂşÄŤovĂ©ho slova
    newArtData.tags=newArtData.tags.filter(tag => tag); //odstrĂˇni tie tagy, ktorĂ© sĂş teraz len prĂˇzdne reĹĄazce


    //2. Set up the request

    const postReqSettings = //an object wih settings of the request
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify(newArtData)
        };


    //3. Execute the request


    fetch(`${serverUrlBase}/article`, postReqSettings)  //now we need the second parameter, an object wih settings of the request.
        .then(response => {      //fetch promise fullfilled (operation completed successfully)
            if (response.ok) {    //successful execution includes an error response from the server. So we have to check the return status of the response here.
                return response.json(); //we return a new promise with the response data in JSON to be processed
            } else { //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`)); //we return a rejected promise to be catched later
            }
        })
        .then(responseJSON => { //here we process the returned response data in JSON ...
            responseJSON.backLink=`#articles`;
            responseJSON.editLink=`#artEdit/${responseJSON.id}`;
            responseJSON.addCommLink=`#commSend/${responseJSON.id}`;
            responseJSON.deleteLink=`#artDelete/${responseJSON.id}`;
            articleElm.innerHTML =
                Mustache.render(document.getElementById(outputTmplId).innerHTML,responseJSON);
        })
        .catch(error => { ////here we process all the failed promises
            articleElm.innerHTML =
                `
                    <h2>Error reading data from the server</h2>
                    ${error}
                `;
        });
}