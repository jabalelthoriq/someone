import re

with open('src/App.jsx', 'r') as f:
    content = f.read()

# Fix paddings for mobile
content = content.replace('px-10', 'px-6 md:px-10')
content = content.replace('px-12', 'px-6 md:px-12')
content = content.replace('p-12', 'p-6 md:p-12')
content = content.replace('px-8', 'px-6 md:px-8')
content = content.replace('min-h-screen grid grid-cols-1 md:grid-cols-2', 'min-h-[100dvh] flex flex-col md:grid md:grid-cols-2')

# Sometimes the image container height is fixed to h-64 on mobile, let's make it min-h-[40vh] for better visuals
content = content.replace('h-64 md:hidden', 'h-[45vh] md:hidden w-full')

# Make the maroon color pop out more
# red-950 to red-900 (which is closer to true maroon)
content = content.replace('red-950', 'red-900')

with open('src/App.jsx', 'w') as f:
    f.write(content)
