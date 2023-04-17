export interface IUsers {
    [key: string]: {
        username: string;
        discriminator: string;
        id?: string;
        subscribed?: boolean;
    };
}
