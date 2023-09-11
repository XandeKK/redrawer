class Log {
  constructor(id) {
    this.elem = document.getElementById(id);
  }
  add(str) {
    if (str === '') return;
    var p = document.createElement("p");
    p.className = 'text-xs p-1'
    p.innerHTML = this.formatAnsiToTailwind(str);
    this.elem.appendChild(p);
    this.elem.scrollTop = this.elem.scrollHeight;
  }

  formatAnsiToTailwind(text) {
    const colorMap = {
      '30': 'text-black',
      '31': 'text-red-600',
      '32': 'text-green-600',
      '33': 'text-yellow-600',
      '34': 'text-blue-600',
      '35': 'text-purple-600',
      '36': 'text-teal-600',
      '37': 'text-gray-300',
      '39': 'text-black',
    };

    for (const code in colorMap) {
      const regex = new RegExp(`\\u001b\\[${code}m`, 'g');
      text = text.replace(regex, `<span class="${colorMap[code]}">`);
    }

    text = text.replace(/\u001b\[0m/g, '</span>');
    text = text.replace(/\u001b\[1m/g, '<span class="font-bold">');
    text = text.replace(/\u001b\[22m/g, '</span>');
    text = text.replace(/\u001b\[4m/g, '<span class="underline">');
    text = text.replace(/\u001b\[24m/g, '</span>');
    text = text.replace(/\n/g, '<br>');

    return text;
  }
}

window.log = new Log('log');