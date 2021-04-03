const config = require("config");
const Telnet = require("telnet-client");
const winston = require("winston");
const _ = require("lodash");
const Channel = require("./Channel")

class ClientConnection{

    params = Object();
    apikey = config.get("ts3client.apikey");
    telnetcon = new Telnet();

    ClientID = null;
    CurrentChannelID = null;

    AllChannels = Array();

/*
    Options:
    port = 25639;
    host = localhost
*/
    async connect(options = {} ){

        winston.info("Connecting to Teamspeak client", options);

        this.params.host = options.host ? options.host : "localhost";
        this.params.port = options.port ? options.port : 25639;
        this.params.timeout = config.get("ts3client.connecttimeout");
        this.params.negotiationMandatory =  false
        //this.params.shellPrompt = "/ #"

        winston.debug("Configured this.params variable", this.params)


        try{
            await this.telnetcon.connect(this.params);

            /*
            This sends an empty request to the server. 
            If I dont send this request, the next request will return the login message instead of the actual response
            */
            await this.telnetcon.send("");
            winston.debug("Telnet connection established")
        }catch(e){
            throw e;
        }
    }

    async login(){

        winston.info("Authenticating");
        const authresult = await this.telnetcon.send("auth apikey="+this.apikey);

        if(!wasCommandSuccessfull(authresult)){
            throw Error(`Login Failed, message: '${authresult}'`)
        }

        winston.debug("Authentication passed");
    }

    async whoami(){
        const whoami = await this.sendCommand("whoami");

        winston.info("Sending Command whoami to the Server")

        if (!wasCommandSuccessfull(whoami)) {
            winston.info("Whoami Failed: " + whoami)
            return false
        }

        const informationPiece = whoami.split("\n")[0];
        const SplittedInfos = informationPiece.split(" ");

        this.ClientID = SplittedInfos[0].split("=")[1];
        this.CurrentChannelID = SplittedInfos[1].split("=")[1];

        return true;

    }

    async initialize(connectoptions = {}){
        await this.connect(connectoptions);
        await this.login();
        await this.whoami();
    }

    async clientmove(ChannelID, ChannelPassword = null){

        winston.info("Moving Channel");

        let result = "";

        if(ChannelPassword == null){
            result = await this.sendCommand(`clientmove cid=${ChannelID} clid=${this.ClientID}`);
        }else{
            result = await this.sendCommand(`clientmove cid=${ChannelID} cpw=${ChannelPassword} clid=${this.ClientID}`);
        }

        if(!wasCommandSuccessfull(result)) {
            winston.info("Error while moving Channel", {response:result})
            return false;
        }

        winston.info("Successfully moved channel, reloading with Whoami Command")
        this.whoami();
        return true;
        
    }

    async channelmove(channelID, channelParentID, order = null){
        if(order != null){
            throw Error("Not Implemented yet")
        }

        const result = await this.sendCommand(`channelmove cid=${channelID} cpid=${channelParentID}`);

        winston.debug("Sent Channel Move Command, ?worked=" + wasCommandSuccessfull(result), {response:result})

        return wasCommandSuccessfull(result);

    }

    //DONE IMPLEMENT !!!!
    async refreshChannelList(options = {}){
        /*
        const topic = options.topic ? "topic="+options.topic : "";
        const flags = options.flags ? "flags="+options.flags : "";
        const voice = options.voice ? "voice="+options.voice : "";
        const icon = options.icon ? "icon="+options.icon : "";
        const limits = options.limits ? "limits="+options.limits : "";
        */
        const result = await this.sendCommand("channellist");

        const successfull = wasCommandSuccessfull(result);

        if(!successfull) return false;

        const ChannelsWithoutProtocolOverhead = result.split("\n")[0];
        const SplittedChannels = ChannelsWithoutProtocolOverhead.split("|");

        this.AllChannels = Array();
        
        for(const ChannelString of SplittedChannels){
            this.AllChannels.push(new Channel(ChannelString));
        }

    }

    async sendCommand(command){
        winston.info("Sending Command");
        const commandresult = await this.telnetcon.send(command);
        return commandresult;
    }

}


function wasCommandSuccessfull(result) {
    /*
    if(typeof result != String){
        return false;
    }*/
    if(!_.includes(result, "error id=0 msg=ok")){
        return false;
    }
    return true;
}


module.exports= ClientConnection;