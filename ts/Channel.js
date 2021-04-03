class Channel{
    ChannelID = null;
    channelParentID = null;
    channel_order = null;
    channel_name = null;
    channel_flag_are_subscribed = null;
    total_clients = null;

    constructor(Description){


        const FinalPairs = new Map();

        const SplittedDescriptons = Description.split(" ");

        for(const KeyValPair of SplittedDescriptons){
            const KeyValSplitted = KeyValPair.split("=");
            FinalPairs.set(KeyValSplitted[0], KeyValSplitted[1])
        }

        this.ChannelID = FinalPairs.get("cid");
        this.channelParentID = FinalPairs.get("pid");
        this.channel_order = FinalPairs.get("channel_order");
        this.channel_name = FinalPairs.get("channel_name");
        this.channel_flag_are_subscribed = FinalPairs.get("channel_flag_are_subscribed");
        this.total_clients = FinalPairs.get("total_clients");

    }

}


module.exports = Channel;