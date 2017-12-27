const Discord = require('discord.js');
const request = require('request');
const language = require('./languages');
const prefix = ".";

var disabledEvents = ['TYPING_START', 'CHANNEL_UPDATE', 'USER_UPDATE'];
var options = {
    disabledEvents: disabledEvents
};
const client = new Discord.Client(options);
client.on("ready", () => {
    console.log("Bot is up and running :)");
    // guilds = client.guilds.array();
    // const channel = guilds[0].channels.find(c => c.name.toLowerCase().includes('div') && c.type === "text");

})

client.on("message", (message) => {
    if(message.content.startsWith(prefix + "tr")) {

        if(message.content[3] != " ") {
            message.channel.send("`Invalid request format.`");
            return;
        }

        // .tr help
        if(message.content.substr(4, message.content.length).trim() == "help") {
            var richEmbed = new Discord.RichEmbed();
            var desc = "**.tr language-code: text-to-translate**. \n\nThe language code is the **destination language** i.e. the language you want your text to be translated into. Language codes are bolded in the list below.\n\n";
            language.languageMap.forEach((value, key, map) => {
                desc = desc + "**" + key + "**" + ":" + value + "\t\t\t";
            })
            richEmbed.setTitle("Usage");
            richEmbed.setDescription(desc);
            richEmbed.setColor('NAVY');
            message.channel.send(richEmbed).then(message => console.log("Help sent"))
            .catch(console.error + ":help:");
            return;
        }

        var index = message.content.indexOf(':', 4);
        if(index == -1) {
            message.channel.send("`Invalid request format.`");
            return;
        }

        // Sanitize the input by removing line breaks and spaces
        var tar = message.content.substr(4, index - 4).trim();
        var target = tar.replace(/(\r\n|\n|\r|" ")/gm,"");
        var targetLanguageName = language.languageMap.get(target);

        if(targetLanguageName == undefined) {
            message.channel.send("`Invalid language code.`");
            return;
        }

        // Translate Using Google Cloud Translation API
        var text = message.content.substr(index + 1, message.content.length).trim();
        var queryString = { target: target, q: text, key: process.env.API_KEY };
        request({
                method: 'POST',
                uri: 'https://translation.googleapis.com/language/translate/v2',
                qs: queryString
            }, function(err, response) {
                if(err) {
                    message.channel.send("`Error. Sorry, the translation couldn't happen for some reason.`")
                    console.log(err);
                }
                if(response) {
                    var result = JSON.parse(response.body);
                    var richEmbed = new Discord.RichEmbed();
                    richEmbed.setTitle("Translate to " + targetLanguageName);
                    richEmbed.setDescription("\n**Source**\n" + text +
                        "\n\n**Translation**\n" + result.data.translations[0].translatedText);
                    richEmbed.setColor('NAVY');
                    message.channel.send(richEmbed).then(message => console.log("Translated"))
                    .catch(console.error + ":translate:");
                    return;
                }
            }
        );

    } 
});

client.login(process.env.BOT_TOKEN);
