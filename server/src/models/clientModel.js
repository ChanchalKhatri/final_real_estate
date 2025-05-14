class ClientModel {
  constructor(client) {
    this.first_name = client.first_name;
    this.last_name = client.last_name;
    this.feedback = client.feedback;
    this.rating = client.rating;
    this.image = client.image;
  }
}

export default ClientModel;
