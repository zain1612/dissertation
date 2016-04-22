
var my_name = 'User';

//create models 
/*var my_model = [
  "conceptualise a ~ festival thing ~ F that is an entity and is an imageable thing.",
  "conceptualise a ~ band ~ B that is a festival thing.",
  "conceptualise a ~ time ~ T.",
  "conceptualise a ~ song ~ S that is a festival thing that has the value W as ~ title ~.",
  "conceptualise an ~ stage ~ L that is a festival thing and is a locatable thing.",
  "conceptualise the song S ~ is played by ~ the musician M.",
  "conceptualise the band B ~ plays at ~ the time T and ~ plays ~ the song S and  and has the stage L as ~ venue ~.",

  "there is a stage named 'pyramid stage' that is in the location 'Main Stages'.",
  "there is a stage named 'other stage' that is in the location 'Main Stages'.",
  "there is a stage named 'west holts' that is in the location 'Main Stages'.",
  "there is a stage named 'the park stage' that is in the location 'Main Stages'.",

  "there is a band named 'Foo Fighters' that plays at the time '10:30pm' and that has the stage 'other stage' as venue and has 'http://www.mtv.com/crop-images/2013/09/11/Foo%20Fighters%20officail.jpg' as image.",
  
];*/

var processed_cards = [];

var streaming_node = [
  "there is an agent named 'Moira' that has 'http://localhost:5555' as address",
  "there is a tell policy named 'p2' that has 'true' as enabled and has the agent 'Moira' as target",
  "there is a listen policy named 'p4' that has 'true' as enabled and has the agent 'Moira' as target"  
]

var node = new CENode(MODELS.CORE,streaming_node);
node.agent.set_name('agent1');

var input = document.getElementById('input');
var button = document.getElementById('send');
var messages = document.getElementById('messages');

button.onclick = send_message;
input.onkeyup = function(e){
    if(e.keyCode == 13){
        send_message();
    }
};

function send_message(){
    var message = input.value.trim(); // CENode seems to need this
    input.value = ''; // blank the input field for new messages
    if (message == '') return; // don't submit empty messages
    var card = "there is a nl card named '{uid}' that is to the agent 'agent1' and is from the individual '"+my_name+"' and has the timestamp '{now}' as timestamp and has '"+message.replace(/'/g, "\\'")+"' as content.";
    node.add_sentence(card);

    // Finally, prepend our message to the list of messages:
    var item = '<li class="'+my_name+'">'+message+'</li>';
    messages.innerHTML = item + messages.innerHTML;
};

function poll_cards(){
    setTimeout(function(){
        var cards = node.concepts.card.all_instances; // Recursively get any cards the agent knows about
        for(var i = 0; i < cards.length; i++){
            var card = cards[i];
            if(card.is_to.name == my_name && processed_cards.indexOf(card.name) == -1){ // If sent to us and is still yet unseen
                processed_cards.push(card.name); // Add this card to the list of 'seen' cards
                var gist = card.content;
                var imgmatch = gist.match(/(http.+\/.*). as image/);
                gist = gist.replace(/ and has [\'\"]http.* as image/, ""); // remove image if in middle/end of gist summary
                gist = gist.replace(/ has [\'\"]http.* as image and/, ""); // remove image if at start of gist summary
                gist = gist.replace(/\..* has [\'\"]http.* as image/, ""); // remove image if all of gist summary
                var item = '<li class="'+card.is_from.name+'">'+gist;
                if(imgmatch != null) {
                  item += "<br><img src='" + imgmatch[1] + "' width='200'>";
                }
                item += '</li>';
                messages.innerHTML = item + messages.innerHTML; // Prepend this new message to our list in the DOM
            }
        }
        poll_cards(); // Restart the method again
    }, 1000);
}

var known_instances = [];

function watch_instances(type){
    setTimeout(function(){
        var instances = node.get_instances(type, true); 
        for(var i = 0; i < instances.length; i++){
            var instance = instances[i].name;
            if (known_instances.indexOf(instance) == -1) {
                known_instances.push(instance);
                var item = '<li class="alert">New instance of '+type+': '+instances[i].ce+'</li>';
                messages.innerHTML = item + messages.innerHTML; 
            }
        }
        watch_instances(type); // Restart the method again
    }, 1000);
}

poll_cards();
