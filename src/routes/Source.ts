
	import { currentEvent, sources, generatedRequests} from './store.js';
	export class Source {
	 	private number: number = 0;
	 	private genTime:  number= 0;
	 	private bufferTime: number = 0;
   	   /// private refusalTime: number = 0;
		private proccessingTime: number =0;
		private generatedRequestsAmount: number = 0;
		

		constructor(index:number) {
			this.number = index;
			this.genTime = 0.0; 
			this.bufferTime = 0;
			///this.refusalTime = 0;
			this.generatedRequestsAmount = 0;
		}

		getNumber():number {
			return this.number;
		}

		getGenTime():number {
			return this.genTime;
		}

		getBufferTime():number {
			return this.bufferTime;
		}

		getProccessingTime():number{
			return this.proccessingTime;
		}

		// getRefusalTime():number{
		// 	return this.refusalTime
		// }

		getGeneratedRequestsAmount():number{
			return this.generatedRequestsAmount;
		}

		generateNewRequest(alfa:number, beta:number, sources_:Source[]){
			this.generateNewRequestTime(alfa, beta);
			this.generatedRequestsAmount+=1;
			generatedRequests.update(count=>count+1);
			currentEvent.set("Источник "+this.number+" сгенерировал заявку №"+this.generatedRequestsAmount);
			let sortedS = sources_.slice().sort((a, b) => a.genTime - b.genTime);
			sources.set(sortedS);
		}

		generateNewRequestTime(alfa:number, beta:number) {
			this.genTime += Number(Number(Math.random() * (beta - alfa))+Number(alfa));
		}

		updateProccesingTime(newProccesingTime:number){
			this.proccessingTime+=newProccesingTime;

		}

		updateBufferTime(newBufferTime:number){
			this.bufferTime+=newBufferTime;

		}
	}

