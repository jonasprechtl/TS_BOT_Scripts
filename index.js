const { cli } = require("winston/lib/winston/config");
const startup = require("./startup/startup");
const clientconnection = require("./ts/ClientConnection");
startup();


const ClientConnection = require("./ts/ClientConnection");



async function test(){
    const clientcon = new ClientConnection();
    await clientcon.initialize();
    await clientcon.clientmove(70466)
    await clientcon.refreshChannelList();
}

test();

/*
const Channel =  require("./ts/Channel")
const c = new Channel("cid=70466 pid=70453 channel_order=70459 channel_name=╚\sRadio\s2\s\p\sI\slove\shits\s2020 channel_flag_are_subscribed=1 total_clients=0")
console.log(c)
*/