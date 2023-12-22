/*
* Params: 
* rejectCallback: Callback called upon promise rejection
* rejectElement: DOMElement to which the reject
* otherPromises: The promises being short circuited upon rejection
* 
* Return: Array, [ShortCircuitPromise, rejectFunc]
*/
export function CreateShortCircuit(params) {
    let rejectFunc
    return [new Promise(async (resolve, reject) => {
        rejectFunc = reject
        //Called when cancel is pressed, rejects the promise short circuiting the promise.all
        function rejectHandler() {
            params.rejectCallback?.()
            reject(params.rejectionMessage || "")
            this.removeEventListener('click', rejectHandler)
        }
        console.log("listening")
        params.rejectElement.addEventListener('click', rejectHandler, {once: true})
        //Wait for animation to finish normally. Will resolve if animation is not cancelled
        await Promise.all(params.otherPromises)
        params.rejectElement.removeEventListener('click', rejectHandler)
        resolve()
    }),
    rejectFunc]
}