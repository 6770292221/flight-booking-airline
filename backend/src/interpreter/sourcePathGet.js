  function sourcePathGet(obj, path) {
    console.log(path.split(".").reduce((acc, key) => acc?.['x'], 'xxx'))
    return path.split(".").reduce((acc, key) => acc?.['x'], 'xx');
  }

  console.log(sourcePathGet({"x": "r"}, 'flag.airlineName'))