function test(){
    try {
        logger.info(router.createGetRoute("penis",(req, res)=>{
            res.send("FUCK YOU")
        }))
    } catch (error) {
        logger.info(`Nuh uh, u suck, theres why: ${error}`)
    }

}
test()