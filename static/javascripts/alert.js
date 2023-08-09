class Alert {
  static color = {
    info: {
      div: 'w-64 flex p-4 mb-1 text-blue-800 border-t-4 border-blue-300 bg-blue-50 dark:text-blue-400 dark:bg-gray-800 dark:border-blue-800',
      button: 'ml-auto -mx-1.5 -my-1.5 bg-blue-50 text-blue-500 rounded-lg focus:ring-2 focus:ring-blue-400 p-1.5 hover:bg-blue-200 inline-flex h-8 w-8 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700'
    },
    danger: {
      div: 'w-64 flex p-4 mb-1 text-red-800 border-t-4 border-red-300 bg-red-50 dark:text-red-400 dark:bg-gray-800 dark:border-red-800',
      button: 'ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex h-8 w-8 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700'
    },
    success: {
      div: 'w-64 flex p-4 mb-1 text-green-800 border-t-4 border-green-300 bg-green-50 dark:text-green-400 dark:bg-gray-800 dark:border-green-800',
      button: 'ml-auto -mx-1.5 -my-1.5 bg-green-50 text-green-500 rounded-lg focus:ring-2 focus:ring-green-400 p-1.5 hover:bg-green-200 inline-flex h-8 w-8 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700'
    },
    warning: {
      div: 'w-64 flex p-4 mb-1 text-yellow-800 border-t-4 border-yellow-300 bg-yellow-50 dark:text-yellow-400 dark:bg-gray-800 dark:border-yellow-800',
      button: 'ml-auto -mx-1.5 -my-1.5 bg-yellow-50 text-yellow-500 rounded-lg focus:ring-2 focus:ring-yellow-400 p-1.5 hover:bg-yellow-200 inline-flex h-8 w-8 dark:bg-gray-800 dark:text-yellow-400 dark:hover:bg-gray-700'
    }
  }

  static alert(msg, status='info') {
    const color = Alert.color[status];

    const div = document.createElement('div');
    div.className = color.div;
    div.setAttribute('role', 'alert');
    div.innerHTML = [
      `<svg class="flex-shrink-0 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>`,
      `<div class="ml-3 text-sm font-medium">`,
        `${msg}`,
      `</div>`
    ].join('');
    
    document.getElementById('alerts').appendChild(div);

    setTimeout(()=> {
      div.style.opacity = "0";
      div.style.transition = "opacity 0.3s ease-in-out";
      setTimeout(()=> {
        div.remove();
      }, 200);
    }, 2000);
  }
}
