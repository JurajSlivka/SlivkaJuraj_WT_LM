let auth2 = {};

function renderUserInfo(googleUser, htmlElmId) {
    const profile = googleUser.getBasicProfile();
    const htmlStringSk=
        `
            <p>PouĹľĂ­vateÄľ prihlĂˇsenĂ˝</p>
            <ul>
                <li> ID: ${profile.getId()}
                <li>  PlnĂ© meno: ${profile.getName()}
                <li>  KrstnĂ© meno: ${profile.getGivenName()}
                <li>  Priezvisko: ${profile.getFamilyName()}
                <li>  URL obrĂˇzka: ${profile.getImageUrl()}
                <li>  Email: ${profile.getEmail()}
            </ul>
        `;
    const htmlStringEn=
        `
            <p>User logged in.</p>
            <ul>
                <li> ID: ${profile.getId()}
                <li>  Full name: ${profile.getName()}
                <li>  Given name: ${profile.getGivenName()}
                <li>  Family name: ${profile.getFamilyName()}
                <li>  Image URL: ${profile.getImageUrl()}
                <li>  Email: ${profile.getEmail()}
            </ul>
        `;
    //Id z profile.getId() sa nema pouzivat na komunikaciu s vlastnym serverom (you should not use the id from profile.getId() for communication with your server)
    document.getElementById("userStatus").innerHTML=htmlStringSk+htmlStringEn;
}

function renderLogOutInfo(htmlElmId) {
    const htmlString=
        `
                <p>PouĹľĂ­vateÄľ nie je prihlĂˇsenĂ˝</p>
                <p>User not signed in</p>
                `;
    document.getElementById(htmlElmId).innerHTML=htmlString;
}

function signOut() {
    if(auth2.signOut) auth2.signOut();
    if(auth2.disconnect) auth2.disconnect();

}

function userChanged(user){
    document.getElementById("userName").innerHTML=user.getBasicProfile().getName();


    var userInfoElm = document.getElementById("userStatus");
    var userNameInputElm = document.getElementById("author");

    if(userInfoElm ){// pre/for 82GoogleAccessBetter.html
        renderUserInfo(user,"userStatus");
    }else if (userNameInputElm){// pre 82GoogleAccessBetterAddArt.html
        userNameInputElm.value=user.getBasicProfile().getName();
    }

}


var updateSignIn = function() {
    var sgnd = auth2.isSignedIn.get();
    if (sgnd) {
        document.getElementById("SignInButton").classList.add("hiddenElm");
        document.getElementById("SignedIn").classList.remove("hiddenElm");
        document.getElementById("userName").innerHTML=auth2.currentUser.get().getBasicProfile().getName();
    }else{
        document.getElementById("SignInButton").classList.remove("hiddenElm");
        document.getElementById("SignedIn").classList.add("hiddenElm");
    }

    var userInfoElm = document.getElementById("userStatus");
    var userNameInputElm = document.getElementById("name");
    var userNameInputElm2 = document.getElementById("authorAdd");
    var userNameInputElm3 = document.getElementById("commentAuthor");

    if(userInfoElm ){// pre 82GoogleAccessBetter.html
        if (sgnd) {
            renderUserInfo(auth2.currentUser.get(),"userStatus");

        }else{
            renderLogOutInfo("userStatus");
        }
    }else if (userNameInputElm){// pre/for 82GoogleAccessBetterAddArt.html
        if (sgnd) {
            userNameInputElm.value=auth2.currentUser.get().getBasicProfile().getName();
        }else{
            userNameInputElm.value="";
        }
    }else if (userNameInputElm2){// pre/for 82GoogleAccessBetterAddArt.html
        if (sgnd) {
            userNameInputElm2.value=auth2.currentUser.get().getBasicProfile().getName();
        }else{
            userNameInputElm2.value="";
        }
    }else if (userNameInputElm3){// pre/for 82GoogleAccessBetterAddArt.html
        if (sgnd) {
            userNameInputElm3.value=auth2.currentUser.get().getBasicProfile().getName();
        }else{
            userNameInputElm3.value="";
        }
    }


}

function startGSingIn() {
    gapi.load('auth2', function() {
        gapi.signin2.render('SignInButton', {
            'width': 240,
            'height': 50,
            'longtitle': true,
            'theme': 'dark',
            'onsuccess': onSuccess,
            'onfailure': onFailure
        });
        gapi.auth2.init().then( //zavolat po inicializĂˇcii OAuth 2.0  (called after OAuth 2.0 initialisation)
            function (){
                console.log('init');
                auth2 = gapi.auth2.getAuthInstance();
                auth2.currentUser.listen(userChanged);
                auth2.isSignedIn.listen(updateSignIn);
                auth2.then(updateSignIn); //tiez po inicializacii (later after initialisation)
            });
    });

}

function onSuccess(googleUser) {
    console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
}
function onFailure(error) {
    console.log(error);
}