// Placeholder para KeyAuth en el futuro
// Por ahora no se usa, las keys se ingresan manualmente

export class KeyAuth {
  constructor(name, ownerid, secret) {
    this.name = name;
    this.ownerid = ownerid;
    this.secret = secret;
  }

  async createKey(days, quantity = 1) {
    // Implementar cuando sea necesario
    return null;
  }
}
