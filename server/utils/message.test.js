const expect = require('expect');

const {generateMessage} = require('./message');

describe('generateMessage', () => {
    it('should generate correct message object', ()=>{
        let from = 'Adam';
        let text = 'Hello from adam';
        let message = generateMessage(from, text);
        
        expect(message.createdAt).toBeA('number');
        expect(message).toInclude({from,text});
    })
})