class Log {
  constructor(id) {
    this.elem = document.getElementById(id);
    this.count = 0;
  }
  add(str) {
    var p = document.createElement("p");
    p.id = 'p-' + this.count
    p.innerHTML = str;
    this.elem.appendChild(p);
    this.elem.scrollTop = this.elem.scrollHeight;

    this.count++;
    if (this.count >= 80) {
      this.remove_all();
      this.count = 0;
    }
  }

  remove_all() {
    for (var i = 0; i <= 80; i++) {
      const elem = document.getElementById('p-' + i);
      if (elem) {
        elem.remove();
      }
    }
  }
}

window.log = new Log('log');