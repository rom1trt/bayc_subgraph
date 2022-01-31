import { ipfs, json, JSONValue } from '@graphprotocol/graph-ts'
import {
  Token as TokenContract,
  Transfer as TransferEvent
} from "../generated/Token/Token"
import { Token, User } from "../generated/schema"

export function handleTransfer(event: TransferEvent): void {
  let baseHash = "QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq"
  let fullIPFSURI = "ipfs.io/ipfs/" + baseHash + "/"
  var token = Token.load(event.params.tokenId.toString());
   if (!token) {
     token = new Token(event.params.tokenId.toString());
     token.owner = event.params.to.toHex()
     token.creator = event.params.to.toHexString();
     token.tokenID = event.params.tokenId;
     token.createdAtTimestamp = event.block.timestamp;
     token.collection = "Bored Ape Yacht Club"
   }
   token.updatedAtTimestamp = event.block.timestamp;
   let tokenContract = TokenContract.bind(event.address);
   let price = tokenContract.apePrice()
   token.price = price
   let baseURI = tokenContract.baseURI()
   let contentURI = tokenContract.tokenURI(event.params.tokenId);
 
   if (baseURI.includes('https')) {
     baseURI = fullIPFSURI;
   } else if (baseURI.includes('ipfs')) {
     let hash = baseURI.split('ipfs://').join('')
     baseURI = "ipfs.io/ipfs" + hash
   }
 
   if (contentURI.includes('https')) {
     contentURI = fullIPFSURI + event.params.tokenId.toString();
   } else {
     let hash = contentURI.split('ipfs://').join('')
     contentURI = "ipfs.io/ipfs/" + hash + event.params.tokenId.toString();
   }
 
   token.contentURI = contentURI;
   token.baseURI = baseURI;
 
   if (contentURI != "") {
     let hash = contentURI.split('ipfs.io/ipfs/').join('')
     let data = ipfs.cat(hash)
 
     if (!data) return
     let value = json.fromBytes(data).toObject()
     if (data) {
       var image = value.get('image')
       if (image) {
         let h =  image.toString()
         let imageHash = h.split('ipfs://').join('')
         token.imageURI = 'ipfs.io/ipfs/' + imageHash
       }
 
       let attributes:JSONValue[]
       let atts = value.get('attributes')
       if (atts) {
         attributes = atts.toArray()
       }
       else {
         attributes = []
       }
 
       for (let i = 0; i < attributes.length; i++) {
         let item = attributes[i].toObject()
         //let trait:string = ""
         let t = item.get('trait_type')
         if (t) {
            let value:string = ""
            let v = item.get('value')
            if (v) {
              value = v.toString()
            }
            if (t.toString() == "Mouth") {
              token.mouth = value
            }

            if (t.toString() == "Eyes") {
              token.eyes = value
            }

            if (t.toString() == "Background") {
              token.background = value
            }
    
            if (t.toString() == "Hat") {
              token.hat = value
            }

            if (t.toString() == "Clothes") {
              token.clothes = value
            }

            if (t.toString() == "Fur") {
              token.fur = value
            }

            if (t.toString() == "Earring") {
              token.earring = value
            }
          }
       }
     }
   }

   token.owner = event.params.to.toHexString();
   token.save();
  
   let user = User.load(event.params.to.toHexString());
   if (!user) {
     user = new User(event.params.to.toHexString());
     user.save();
   }
 }