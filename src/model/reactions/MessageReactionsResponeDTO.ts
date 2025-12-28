export interface MessageReactionsResponseDTO{
    
    messageId : number;

    reactions : CountMessageReactionsDTO[];

   

}

export interface CountMessageReactionsDTO{
    MessageReactionId: number;
    reaction: string;      
    totalReactions: number;
}








