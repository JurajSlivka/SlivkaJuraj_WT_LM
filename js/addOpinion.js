/*
 * Created by Stefan Korecko, 2020
 * Form processing functionality
 */


function processOpnFrmData(event){
    //1.prevent normal event (form sending) processing
    event.preventDefault();

    //2. Read and adjust data from the form (here we remove white spaces before and after the strings)
    const nopName = document.getElementById("name").value.trim();
    const nopEmail = document.getElementById("email").value.trim();
    const nopOpn = document.getElementById("textarea").value.trim();

    //3. Verify the data
    if(nopName=="" || nopOpn==""){
        window.alert("Please, enter both your name and opinion");
        return;
    }

    let nopTeam = null;
    const team = document.getElementsByName('team');
    for (let i = 0; i< team.length; i++)  {
        if (team[i].checked) {
            nopTeam = team[i].value;
        }
    }


    //3. Add the data to the array opinions and local storage
    const newOpinion =
        {
            name: nopName,
            email: nopEmail,
            comment: nopOpn,
            team: nopTeam,
            created: new Date()

        };


    let opinions = [];

    if(localStorage.myTreesComments){
        opinions=JSON.parse(localStorage.myTreesComments);
    }

    opinions.push(newOpinion);
    localStorage.myTreesComments = JSON.stringify(opinions);


    //5. Go to the opinions
    window.location.hash="#opinions";

}
