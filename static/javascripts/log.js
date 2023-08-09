class Log {
  constructor(id) {
    this.elem = document.getElementById(id);
    this.count = 0;
  }
  add(str) {
    var p = document.createElement("p");
    p.id = 'p-' + this.count
    p.className = 'text-xs p-1'
    p.innerHTML = str;
    this.elem.appendChild(p);
    this.elem.scrollTop = this.elem.scrollHeight;

    this.count++;
    if (this.count >= 100) {
      this.remove_all();
      this.count = 0;
    }
  }

  remove_all() {
    for (var i = 0; i <= 100; i++) {
      const elem = document.getElementById('p-' + i);
      if (elem) {
        elem.remove();
      }
    }
  }
}

window.log = new Log('log');