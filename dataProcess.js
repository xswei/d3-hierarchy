function process (__d3, data) {
  let _d3 = __d3
  let _root = {
    values: nester(data)
  }

  function nester (_list) {
    let _res = _d3.nest()
      .key((d) => {return d.SSXD})
      .key((d) => {return d.SSDY})
      .key((d) => {return d.SSPT || '__noParent'})
      .entries(_data)
    return _res
  }

  function mount (_o, _t) {
    let _oChildrens = _o.children
    _oChildrens.forEach((_oc) => {
      _oc.parent = _o.parent
    })
    _t.children = _t.children.filter((d) => {
      return d!== _o
    })
    _t.children = _t.children.concat(_oChildrens)
  }

  function hierarchyToFlat (_tree) {
    let _resList = []
    let _hierarchy = _d3.hierarchy(_tree, (d) => {
      return d.values
    }).eachBefore((d) => {
      if (d.children && d.data.key === '__noParent') {
        let _ans = d.ancestors()
        for (let i = 0; i< _ans.length; ++i) {
          if (_ans[i] !== d) {
            mount(d, _ans[i])
            d.needRemove = true
            d.depth = null
            break
          }
        }
      }
    })
    _d3.hierarchy(_hierarchy)
      .eachBefore((d) => {
        d.data = d.data.data
        if (d.depth !== 0) {
          _resList.push(d)
        }
      })
    return _resList
  }

  return hierarchyToFlat(_root)
}

module.exports = process
