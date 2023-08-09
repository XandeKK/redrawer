import os

def get_directory_tree(path):
    tree = {'type': 'dir', 'name': path, 'children': []}
    try:
        lst = os.listdir(path)
    except OSError:
        pass
    else:
        for name in lst:
            fn = os.path.join(path, name)
            if os.path.isdir(fn):
                tree['children'].append(get_directory_tree(fn))
            else:
                tree['children'].append({'type': 'file', 'name': name})
    return tree

path = 'static'
tree = [get_directory_tree(path)]
print(tree)