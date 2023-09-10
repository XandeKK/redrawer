class Log {
  constructor(id) {
    this.elem = document.getElementById(id);
  }
  add(str) {
    if (str === '') return;
    var p = document.createElement("p");
    p.className = 'text-xs p-1'
    p.innerHTML = formatAnsiToTailwind(str);
    this.elem.appendChild(p);
    this.elem.scrollTop = this.elem.scrollHeight;
  }

  formatAnsiToTailwind(text) {
    text = text.replace(/\u001b\[1m/g, '<span class="font-bold">');
    text = text.replace(/\u001b\[22m/g, '</span>');
    text = text.replace(/\u001b\[4m/g, '<span class="underline">');
    text = text.replace(/\u001b\[24m/g, '</span>');
    text = text.replace(/\n/g, '<br>');

    return text;
  }
}

window.log = new Log('log');