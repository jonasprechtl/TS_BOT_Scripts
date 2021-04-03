const winston = require("winston");

module.exports = function(){

    if (process.env.NODE_ENV == "debug") {
        winston.add(new winston.transports.Console({
            level:"debug"
        }));

        process.on("unhandledRejection", (error)=>{
            console.log(error);
            process.exit(1);
        })
        process.on("uncaughtException", (error)=>{
            console.log(error);
            process.exit(1);
        })

    }

    if (process.env.NODE_ENV == "production") {
        winston.add(
            new winston.transports.File(
                {
                    filename: "logs/log_" + Date.now() + "_.log",
                }
            )
        )

        //unexcepted error handling
        //not in debug if clause, because the error should be displayed on console
        process.on("unhandledRejection", (error)=>{
            winston.error("unhandledRejection", error)
            process.exit(1);
        })
        process.on("uncaughtException", (error)=>{
            winston.error("uncaughtException", error)
            process.exit(1);
        })

    }



    winston.debug("Winston Logger has been configured to Enviroment:" + process.env.NODE_ENV);

}