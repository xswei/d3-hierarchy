# d3-hierarchy

许多数据集从从本质上是嵌套结构的。考虑在 [geographic entities](https://www.census.gov/geo/reference/hierarchy.html) 应用场景中，比如人口普查，人口结构以及国家和州；企业和政府的组织结构；文件系统和软件包。甚至非层级的数据也可以被组合成层级数据结构，比如 [*k*-means clustering(*k* - means 聚类)](https://en.wikipedia.org/wiki/K-means_clustering) or [phylogenetic trees (生态系统树)](https://bl.ocks.org/mbostock/c034d66572fd6bd6815a)。

这个模块实现了几种经典的对层次结构数据的可视化技术：

**Node-link diagrams**(节点-链接图) 对节点和边使用离散的标记来展示拓扑结构，比如节点展示为圆并且父子节点之间使用线连接。[“tidy” tree](#tree) 结构更紧密，而 [dendrogram](#cluster) 则将所有的叶节点放置在同一水平线上。(它们都有极坐标系和笛卡尔坐标系两种形式。) [Indented trees(缩进树)](https://bl.ocks.org/mbostock/1093025) 对交互式展示很有用。

**Adjacency diagrams**(邻接图) 使用节点的相对位置展示拓扑结构。这种展示方式将每个节点编码为定量的区域，比如使用区域大小表示收入或文件大小。[“icicle” diagram](#partition) 使用矩形表示区域，而 “sunburst” 则使用分段环形图来表示。

**Enclosure diagrams**(包裹图) 也是一种区域编码，但是通过相互包含的形式来展示拓扑结构。[treemap](#treemap) 递归的将一个区域划分为更小的矩形区域。[Circle-packing](#pack) 则通过相互紧凑嵌套的圆来表示, 虽然空间利用率不高，但是能更明显的展示拓扑结构。

一个好的层次结构可视化能促进快速的促进多尺度推理: 对单个单元的微观观察和对整体的宏观观察.

## Installing

`NPM` 安装：`npm install d3-hierarchy`. 此外还可以下载 [latest release](https://github.com/d3/d3-hierarchy/releases/latest). 可以直接从 [d3js.org](https://d3js.org) 以 [standalone library](https://d3js.org/d3-hierarchy.v1.min.js) 或作为 [D3 4.0](https://github.com/d3/d3) 的一部分直接载入. 支持 `AMD`, `CommonJS` 和基础的标签引入形式，如果使用标签引入则会暴露 `d3` 全局变量:

```html
<script src="https://d3js.org/d3-hierarchy.v1.min.js"></script>
<script>

var treemap = d3.treemap();

</script>
```

[在浏览器中测试 `d3-hierarchy`.](https://tonicdev.com/npm/d3-hierarchy)

## API Reference

* [Hierarchy](#hierarchy) ([Stratify](#stratify))
* [Cluster](#cluster)
* [Tree](#tree)
* [Treemap](#treemap) ([Treemap Tiling](#treemap-tiling))
* [Partition](#partition)
* [Pack](#pack)

### Hierarchy

在计算层次布局之前，你需要一个根节点。如果你的数据已经是层次结构，比如 `JSON`。你可以直接将其传递给 [d3.hierarchy](#hierarchy); 此外，你可以重新排列扁平数据，比如将 `CSV` 使用 [d3.stratify](#stratify) 重组为层次结构数据。

<a name="hierarchy" href="#hierarchy">#</a> d3.<b>hierarchy</b>(<i>data</i>[, <i>children</i>]) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/hierarchy/index.js#L12 "Source")

根据指定的层次结构数据构造一个根节点。指定的数据 *data* 必须为一个表示根节点的对象。比如:

```json
{
  "name": "Eve",
  "children": [
    {
      "name": "Cain"
    },
    {
      "name": "Seth",
      "children": [
        {
          "name": "Enos"
        },
        {
          "name": "Noam"
        }
      ]
    },
    {
      "name": "Abel"
    },
    {
      "name": "Awan",
      "children": [
        {
          "name": "Enoch"
        }
      ]
    },
    {
      "name": "Azura"
    }
  ]
}
```

指定的 *children* 访问器会为每个数据进行调用，从根 *data* 开始，并且必须返回一个数组用以表示当前数据的子节点，返回 `null` 表示当前数据没有子节点。如果没有指定 *children* 则默认为: 

```js
function children(d) {
  return d.children;
}
```

返回的节点和每一个后代会被附加如下属性:

* *node*.data - 关联的数据，由 [constructor](#hierarchy) 指定.
* *node*.depth - 当前节点的深度, 根节点为 `0`.
* *node*.height - 当前节点的高度, 叶节点为 `0`.
* *node*.parent - 当前节点的父节点, 根节点为 `null`.
* *node*.children - 当前节点的孩子节点(如果有的话); 叶节点为 `undefined`.
* *node*.value - 当前节点以及 [descendants](#node_descendants)(后代节点) 的总计值; 可以通过 [*node*.sum](#node_sum) 和 [*node*.count](#node_count) 计算.

这个方法也可以用来测试一个节点是否是 `instanceof d3.hierarchy` 并且可以用来扩展节点原型链。

<a name="node_ancestors" href="#node_ancestors">#</a> <i>node</i>.<b>ancestors</b>() [<>](https://github.com/d3/d3-hierarchy/blob/master/src/hierarchy/ancestors.js "Source")

返回祖先节点数组，第一个节点为自身，然后依次为从自身到根节点的所有节点。

<a name="node_descendants" href="#node_descendants">#</a> <i>node</i>.<b>descendants</b>() [<>](https://github.com/d3/d3-hierarchy/blob/master/src/hierarchy/descendants.js "Source")

返回后代节点数组，第一个节点为自身，然后依次为所有子节点的拓扑排序。

<a name="node_leaves" href="#node_leaves">#</a> <i>node</i>.<b>leaves</b>() [<>](https://github.com/d3/d3-hierarchy/blob/master/src/hierarchy/leaves.js "Source")

返回叶节点数组，叶节点是没有孩子节点的节点。

<a name="node_path" href="#node_path">#</a> <i>node</i>.<b>path</b>(<i>target</i>) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/hierarchy/path.js "Source")

返回从当前 *node* 到指定 *target* 节点的最短路径。路径从当前节点开始，遍历到当前 *node* 和 *target* 节点共同最近祖先，然后到 *target* 节点。这个方法对 [hierarchical edge bundling](https://bl.ocks.org/mbostock/7607999)(分层边捆绑) 很有用。

<a name="node_links" href="#node_links">#</a> <i>node</i>.<b>links</b>() [<>](https://github.com/d3/d3-hierarchy/blob/master/src/hierarchy/links.js "Source")

返回当前 *node* 的 `links` 数组, 其中每个 *link* 是一个定义了 *source* 和 *target* 属性的对象。每个 `link` 的 `source` 为父节点, `target` 为子节点。

<a name="node_sum" href="#node_sum">#</a> <i>node</i>.<b>sum</b>(<i>value</i>) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/hierarchy/sum.js "Source")

从当前 *node* 开始以 [post-order traversal](#node_eachAfter) 的次序为当前节点以及每个后代节点调用指定的 *value* 函数，并返回当前 *node*。这个过程会为每个节点附加 *node*.value 数值属性，属性值是当前节点的 `value` 值和所有后代的 `value` 的合计，函数的返回值必须为非负数值类型。*value* 访问器会为当前节点和每个后代节点进行评估，包括内部结点；如果你仅仅想让叶节点拥有内部值，则可以在遍历到叶节点时返回 `0`。例如 [这个例子](http://bl.ocks.org/mbostock/b4c0f143db88a9eb01a315a1063c1d77)，使用如下设置等价于 [*node*.count](#node_count):

```js
root.sum(function(d) { return d.value ? 1 : 0; });
```

在进行层次布局之前必须调用 *node*.sum 或 [*node*.count](#node_count)，因为布局需要 *node*.value 属性，比如 [d3.treemap](#treemap)。`API` 支持方法的 [method chaining](https://en.wikipedia.org/wiki/Method_chaining) (链式调用), 因此你可以在计算布局之前调用 *node*.sum 和 [*node*.sort](#node_sort), 随后生成 [descendant nodes](#node_descendants) 数组, 比如:

```js
var treemap = d3.treemap()
    .size([width, height])
    .padding(2);

var nodes = treemap(root
    .sum(function(d) { return d.value; })
    .sort(function(a, b) { return b.height - a.height || b.value - a.value; }))
  .descendants();
```

这个例子假设 `node` 数据包含 `value` 字段.

<a name="node_count" href="#node_count">#</a> <i>node</i>.<b>count</b>() [<>](https://github.com/d3/d3-hierarchy/blob/master/src/hierarchy/count.js "Source")

计算当前 *node* 下所有叶节点的数量，并将其分配到 *node*.value 属性, 同时该节点的所有后代节点也会被自动计算其所属下的所有叶节点数量。如果 *node* 为叶节点则 `count` 为 `1`。该操作返回当前 *node*。对比 [*node*.sum](#node_sum)。

<a name="node_sort" href="#node_sort">#</a> <i>node</i>.<b>sort</b>(<i>compare</i>) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/hierarchy/sort.js "Source")

以 [pre-order traversal](#node_eachBefore) 的次序对当前 *node* 以及其所有的后代节点的子节点进行排序，指定的 *compare* 函数以 *a* 和 *b* 两个节点为参数。返回当前 *node*。如果 *a* 在 *b* 前面则应该返回一个比 `0` 小的值，如果 *b* 应该在 *a* 前面则返回一个比 `0` 大的值，否则不改变 *a* 和 *b* 的相对位置。参考 [*array*.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) 获取更多信息。

与 [*node*.sum](#node_sum) 不同，*compare* 函数传递两个 [nodes](#hierarchy) 实例而不是两个节点的数据。例如，如果数据包含 `value` 属性，则根据节点以及此节点所有的后续节点的聚合值进行降序排序，就像 [circle-packing](#pack) 一样:

```js
root
    .sum(function(d) { return d.value; })
    .sort(function(a, b) { return b.value - a.value; });
``````

类似的，按高度降序排列 (与任何后代的距离最远) 然后按值降序排列，是绘制 [treemaps](#treemap) 和 [icicles](#partition) 的推荐排序方式:

```js
root
    .sum(function(d) { return d.value; })
    .sort(function(a, b) { return b.height - a.height || b.value - a.value; });
```

先对高度进行降序，然后按照 `id` 进行升序排列，是绘制 [trees](#tree) 和 [dendrograms](#cluster) 的推荐排序方式:

```js
root
    .sum(function(d) { return d.value; })
    .sort(function(a, b) { return b.height - a.height || a.id.localeCompare(b.id); });
```

如果想在可视化布局中使用排序，则在调用层次布局之前，必须先调用 *node*.sort；参考 [*node*.sum](#node_sum)。

<a name="node_each" href="#node_each">#</a> <i>node</i>.<b>each</b>(<i>function</i>) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/hierarchy/each.js "Source")

以 [breadth-first order](https://en.wikipedia.org/wiki/Breadth-first_search)(广度优先) 的次序为每个 *node* 调用执行的 *function*, 一个给定的节点只有在比其深度更小或者在此节点之前的相同深度的节点都被访问过之后才会被访问。指定的函数会将当前 *node* 作为参数。

<a name="node_eachAfter" href="#node_eachAfter">#</a> <i>node</i>.<b>eachAfter</b>(<i>function</i>) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/hierarchy/eachAfter.js "Source")

以 [post-order traversal](https://en.wikipedia.org/wiki/Tree_traversal#Post-order)(后序遍历) 的次序为每个 *node* 调用执行的 *function*，当每个节点被访问前，其所有的后代节点都已经被访问过。指定的函数会将当前 *node* 作为参数。

<a name="node_eachBefore" href="#node_eachBefore">#</a> <i>node</i>.<b>eachBefore</b>(<i>function</i>) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/hierarchy/eachBefore.js "Source")

以 [pre-order traversal](https://en.wikipedia.org/wiki/Tree_traversal#Pre-order)(前序遍历) 的次序为每个 *node* 调用执行的 *function*，当每个节点被访问前，其所有的祖先节点都已经被访问过。指定的函数会将当前 *node* 作为参数。

<a name="node_copy" href="#node_copy">#</a> <i>node</i>.<b>copy</b>() [<>](https://github.com/d3/d3-hierarchy/blob/master/src/hierarchy/index.js#L39 "Source")

以当前节点 *node* 为根节点，返回子树的深拷贝副本。(但是副本与当前子树仍然共享同一份数据)。当前节点为返回子树的根节点，返回的节点的 `parent` 属性总是 `null` 并且 `depth` 总是 `0`.

#### Stratify

考虑如下关系的列表:

Name  | Parent
------|--------
Eve   |
Cain  | Eve
Seth  | Eve
Enos  | Seth
Noam  | Seth
Abel  | Eve
Awan  | Eve
Enoch | Awan
Azura | Eve

这些名称时独一无二的，因此我们可以将上述表示层级数据的列表表示为 `CSV` 文件：

```
name,parent
Eve,
Cain,Eve
Seth,Eve
Enos,Seth
Noam,Seth
Abel,Eve
Awan,Eve
Enoch,Awan
Azura,Eve
```

解析 `CSV` 使用 [d3.csvParse](https://github.com/xs-wei/d3-dsv#csvParse):

```js
var table = d3.csvParse(text);
```

然后返回:

```json
[
  {"name": "Eve",   "parent": ""},
  {"name": "Cain",  "parent": "Eve"},
  {"name": "Seth",  "parent": "Eve"},
  {"name": "Enos",  "parent": "Seth"},
  {"name": "Noam",  "parent": "Seth"},
  {"name": "Abel",  "parent": "Eve"},
  {"name": "Awan",  "parent": "Eve"},
  {"name": "Enoch", "parent": "Awan"},
  {"name": "Azura", "parent": "Eve"}
]
```

转为层次结构数据:

```js
var root = d3.stratify()
    .id(function(d) { return d.name; })
    .parentId(function(d) { return d.parent; })
    (table);
```

返回:

[<img alt="Stratify" src="https://raw.githubusercontent.com/d3/d3-hierarchy/master/img/stratify.png">](https://tonicdev.com/mbostock/56fed33d8630b01300f72daa)

此时的层次数据才可以被传递给层次布局来可视化，比如 [d3.tree](#_tree).

<a name="stratify" href="#stratify">#</a> d3.<b>stratify</b>() [<>](https://github.com/d3/d3-hierarchy/blob/master/src/stratify.js "Source")

使用默认的配置构造一个新的 `stratify`(分层) 操作。

<a name="_stratify" href="#_stratify">#</a> <i>stratify</i>(<i>data</i>) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/stratify.js#L20 "Source")

根据执行的扁平 *data* 生成一个新的层次结构数据.

<a name="stratify_id" href="#stratify_id">#</a> <i>stratify</i>.<b>id</b>([<i>id</i>]) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/stratify.js#L64 "Source")

如果指定了 *id*, 则将 `id` 访问器设置为指定的函数并返回分层操作。否则返回当前的 `id` 访问器, 默认为:

```js
function id(d) {
  return d.id;
}
```

`id` 访问器会为每个输入到 [stratify operator](#_stratify) 的数据元素进行调用，并传递当前数据 *d* 以及当前索引 *i*. 返回的字符串会被用来识别节点与 [parent id](#stratify_parentId)(父节点 `id`) 之间的关系。对于叶节点，`id` 可能是 `undefined`; 此外 `id` 必须是唯一的。(`Null` 和空字符串等价于 `undefined`).

<a name="stratify_parentId" href="#stratify_parentId">#</a> <i>stratify</i>.<b>parentId</b>([<i>parentId</i>]) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/stratify.js#L68 "Source")

如果指定了 *parentId*，则将当前父节点 `id` 访问器设置为给定的函数，并返回分层操作。否则返回当前父节点 `id` 访问器, 默认为:

```js
function parentId(d) {
  return d.parentId;
}
```

父节点 `id` 访问器会为每个输入的元素进行调用，并传递当前元素 *d* 以及当前索引 *i*. 返回的字符串用来识别节点与 [id](#stratify_id) 的关系。对于根节点, 其父节点 `id` 应该为 `undefined`。(`Null` 和空字符串等价于 `undefined`)。输入数据必须有一个根节点并且没有循环引用关系。

### Cluster

[<img alt="Dendrogram" src="https://raw.githubusercontent.com/d3/d3-hierarchy/master/img/cluster.png">](http://bl.ocks.org/mbostock/ff91c1558bc570b08539547ccc90050b)

The **cluster layout** produces [dendrograms](http://en.wikipedia.org/wiki/Dendrogram): node-link diagrams that place leaf nodes of the tree at the same depth. Dendograms are typically less compact than [tidy trees](#tree), but are useful when all the leaves should be at the same level, such as for hierarchical clustering or [phylogenetic tree diagrams](http://bl.ocks.org/mbostock/c034d66572fd6bd6815a).

<a name="cluster" href="#cluster">#</a> d3.<b>cluster</b>() [<>](https://github.com/d3/d3-hierarchy/blob/master/src/cluster.js "Source")

Creates a new cluster layout with default settings.

<a name="_cluster" href="#_cluster">#</a> <i>cluster</i>(<i>root</i>) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/cluster.js#L39 "Source")

Lays out the specified *root* [hierarchy](#hierarchy), assigning the following properties on *root* and its descendants:

* *node*.x - the *x*-coordinate of the node
* *node*.y - the *y*-coordinate of the node

The coordinates *x* and *y* represent an arbitrary coordinate system; for example, you can treat *x* as an angle and *y* as a radius to produce a [radial layout](http://bl.ocks.org/mbostock/4739610f6d96aaad2fb1e78a72b385ab). You may want to call [*root*.sort](#node_sort) before passing the hierarchy to the cluster layout.

<a name="cluster_size" href="#cluster_size">#</a> <i>cluster</i>.<b>size</b>([<i>size</i>]) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/cluster.js#L75 "Source")

If *size* is specified, sets this cluster layout’s size to the specified two-element array of numbers [*width*, *height*] and returns this cluster layout. If *size* is not specified, returns the current layout size, which defaults to [1, 1]. A layout size of null indicates that a [node size](#cluster_nodeSize) will be used instead. The coordinates *x* and *y* represent an arbitrary coordinate system; for example, to produce a [radial layout](http://bl.ocks.org/mbostock/4739610f6d96aaad2fb1e78a72b385ab), a size of [360, *radius*] corresponds to a breadth of 360° and a depth of *radius*.

<a name="cluster_nodeSize" href="#cluster_nodeSize">#</a> <i>cluster</i>.<b>nodeSize</b>([<i>size</i>]) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/cluster.js#L79 "Source")

If *size* is specified, sets this cluster layout’s node size to the specified two-element array of numbers [*width*, *height*] and returns this cluster layout. If *size* is not specified, returns the current node size, which defaults to null. A node size of null indicates that a [layout size](#cluster_size) will be used instead. When a node size is specified, the root node is always positioned at ⟨0, 0⟩.

<a name="cluster_separation" href="#cluster_separation">#</a> <i>cluster</i>.<b>separation</b>([<i>separation</i>]) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/cluster.js#L71 "Source")

If *separation* is specified, sets the separation accessor to the specified function and returns this cluster layout. If *separation* is not specified, returns the current separation accessor, which defaults to:

```js
function separation(a, b) {
  return a.parent == b.parent ? 1 : 2;
}
```

The separation accessor is used to separate neighboring leaves. The separation function is passed two leaves *a* and *b*, and must return the desired separation. The nodes are typically siblings, though the nodes may be more distantly related if the layout decides to place such nodes adjacent.

### Tree

[<img alt="Tidy Tree" src="https://raw.githubusercontent.com/d3/d3-hierarchy/master/img/tree.png">](http://bl.ocks.org/mbostock/9d0899acb5d3b8d839d9d613a9e1fe04)

The **tree** layout produces tidy node-link diagrams of trees using the [Reingold–Tilford “tidy” algorithm](http://reingold.co/tidier-drawings.pdf), improved to run in linear time by [Buchheim *et al.*](http://dirk.jivas.de/papers/buchheim02improving.pdf) Tidy trees are typically more compact than [dendograms](#cluster).

<a name="tree" href="#tree">#</a> d3.<b>tree</b>() [<>](https://github.com/d3/d3-hierarchy/blob/master/src/tree.js "Source")

Creates a new tree layout with default settings.

<a name="_tree" href="#_tree">#</a> <i>tree</i>(<i>root</i>) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/tree.js#L106 "Source")

Lays out the specified *root* [hierarchy](#hierarchy), assigning the following properties on *root* and its descendants:

* *node*.x - the *x*-coordinate of the node
* *node*.y - the *y*-coordinate of the node

The coordinates *x* and *y* represent an arbitrary coordinate system; for example, you can treat *x* as an angle and *y* as a radius to produce a [radial layout](http://bl.ocks.org/mbostock/2e12b0bd732e7fe4000e2d11ecab0268). You may want to call [*root*.sort](#node_sort) before passing the hierarchy to the tree layout.

<a name="tree_size" href="#tree_size">#</a> <i>tree</i>.<b>size</b>([<i>size</i>]) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/tree.js#L228 "Source")

If *size* is specified, sets this tree layout’s size to the specified two-element array of numbers [*width*, *height*] and returns this tree layout. If *size* is not specified, returns the current layout size, which defaults to [1, 1]. A layout size of null indicates that a [node size](#tree_nodeSize) will be used instead. The coordinates *x* and *y* represent an arbitrary coordinate system; for example, to produce a [radial layout](http://bl.ocks.org/mbostock/2e12b0bd732e7fe4000e2d11ecab0268), a size of [360, *radius*] corresponds to a breadth of 360° and a depth of *radius*.

<a name="tree_nodeSize" href="#tree_nodeSize">#</a> <i>tree</i>.<b>nodeSize</b>([<i>size</i>]) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/tree.js#L232 "Source")

If *size* is specified, sets this tree layout’s node size to the specified two-element array of numbers [*width*, *height*] and returns this tree layout. If *size* is not specified, returns the current node size, which defaults to null. A node size of null indicates that a [layout size](#tree_size) will be used instead. When a node size is specified, the root node is always positioned at ⟨0, 0⟩.

<a name="tree_separation" href="#tree_separation">#</a> <i>tree</i>.<b>separation</b>([<i>separation</i>]) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/tree.js#L224 "Source")

If *separation* is specified, sets the separation accessor to the specified function and returns this tree layout. If *separation* is not specified, returns the current separation accessor, which defaults to:

```js
function separation(a, b) {
  return a.parent == b.parent ? 1 : 2;
}
```

A variation that is more appropriate for radial layouts reduces the separation gap proportionally to the radius:

```js
function separation(a, b) {
  return (a.parent == b.parent ? 1 : 2) / a.depth;
}
```

The separation accessor is used to separate neighboring nodes. The separation function is passed two nodes *a* and *b*, and must return the desired separation. The nodes are typically siblings, though the nodes may be more distantly related if the layout decides to place such nodes adjacent.

### Treemap

[<img alt="Treemap" src="https://raw.githubusercontent.com/d3/d3-hierarchy/master/img/treemap.png">](http://bl.ocks.org/mbostock/6bbb0a7ff7686b124d80)

Introduced by [Ben Shneiderman](http://www.cs.umd.edu/hcil/treemap-history/) in 1991, a **treemap** recursively subdivides area into rectangles according to each node’s associated value. D3’s treemap implementation supports an extensible [tiling method](#treemap_tile): the default [squarified](#treemapSquarify) method seeks to generate rectangles with a [golden](https://en.wikipedia.org/wiki/Golden_ratio) aspect ratio; this offers better readability and size estimation than [slice-and-dice](#treemapSliceDice), which simply alternates between horizontal and vertical subdivision by depth.

<a name="treemap" href="#treemap">#</a> d3.<b>treemap</b>()

Creates a new treemap layout with default settings.

<a name="_treemap" href="#_treemap">#</a> <i>treemap</i>(<i>root</i>) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/index.js#L18 "Source")

Lays out the specified *root* [hierarchy](#hierarchy), assigning the following properties on *root* and its descendants:

* *node*.x0 - the left edge of the rectangle
* *node*.y0 - the top edge of the rectangle
* *node*.x1 - the right edge of the rectangle
* *node*.y1 - the bottom edge of the rectangle

You must call [*root*.sum](#node_sum) before passing the hierarchy to the treemap layout. You probably also want to call [*root*.sort](#node_sort) to order the hierarchy before computing the layout.

<a name="treemap_tile" href="#treemap_tile">#</a> <i>treemap</i>.<b>tile</b>([<i>tile</i>]) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/index.js#L61 "Source")

If *tile* is specified, sets the [tiling method](#treemap-tiling) to the specified function and returns this treemap layout. If *tile* is not specified, returns the current tiling method, which defaults to [d3.treemapSquarify](#treemapSquarify) with the golden ratio.

<a name="treemap_size" href="#treemap_size">#</a> <i>treemap</i>.<b>size</b>([<i>size</i>]) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/index.js#L57 "Source")

If *size* is specified, sets this treemap layout’s size to the specified two-element array of numbers [*width*, *height*] and returns this treemap layout. If *size* is not specified, returns the current size, which defaults to [1, 1].

<a name="treemap_round" href="#treemap_round">#</a> <i>treemap</i>.<b>round</b>([<i>round</i>]) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/index.js#L53 "Source")

If *round* is specified, enables or disables rounding according to the given boolean and returns this treemap layout. If *round* is not specified, returns the current rounding state, which defaults to false.

<a name="treemap_padding" href="#treemap_padding">#</a> <i>treemap</i>.<b>padding</b>([<i>padding</i>]) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/index.js#L65 "Source")

If *padding* is specified, sets the [inner](#treemap_paddingInner) and [outer](#treemap_paddingOuter) padding to the specified number or function and returns this treemap layout. If *padding* is not specified, returns the current inner padding function.

<a name="treemap_paddingInner" href="#treemap_paddingInner">#</a> <i>treemap</i>.<b>paddingInner</b>([<i>padding</i>]) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/index.js#L69 "Source")

If *padding* is specified, sets the inner padding to the specified number or function and returns this treemap layout. If *padding* is not specified, returns the current inner padding function, which defaults to the constant zero. If *padding* is a function, it is invoked for each node with children, being passed the current node. The inner padding is used to separate a node’s adjacent children.

<a name="treemap_paddingOuter" href="#treemap_paddingOuter">#</a> <i>treemap</i>.<b>paddingOuter</b>([<i>padding</i>]) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/index.js#L73 "Source")

If *padding* is specified, sets the [top](#treemap_paddingTop), [right](#treemap_paddingRight), [bottom](#treemap_paddingBottom) and [left](#treemap_paddingLeft) padding to the specified number or function and returns this treemap layout. If *padding* is not specified, returns the current top padding function.

<a name="treemap_paddingTop" href="#treemap_paddingTop">#</a> <i>treemap</i>.<b>paddingTop</b>([<i>padding</i>]) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/index.js#L77 "Source")

If *padding* is specified, sets the top padding to the specified number or function and returns this treemap layout. If *padding* is not specified, returns the current top padding function, which defaults to the constant zero. If *padding* is a function, it is invoked for each node with children, being passed the current node. The top padding is used to separate the top edge of a node from its children.

<a name="treemap_paddingRight" href="#treemap_paddingRight">#</a> <i>treemap</i>.<b>paddingRight</b>([<i>padding</i>]) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/index.js#L81 "Source")

If *padding* is specified, sets the right padding to the specified number or function and returns this treemap layout. If *padding* is not specified, returns the current right padding function, which defaults to the constant zero. If *padding* is a function, it is invoked for each node with children, being passed the current node. The right padding is used to separate the right edge of a node from its children.

<a name="treemap_paddingBottom" href="#treemap_paddingBottom">#</a> <i>treemap</i>.<b>paddingBottom</b>([<i>padding</i>]) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/index.js#L85 "Source")

If *padding* is specified, sets the bottom padding to the specified number or function and returns this treemap layout. If *padding* is not specified, returns the current bottom padding function, which defaults to the constant zero. If *padding* is a function, it is invoked for each node with children, being passed the current node. The bottom padding is used to separate the bottom edge of a node from its children.

<a name="treemap_paddingLeft" href="#treemap_paddingLeft">#</a> <i>treemap</i>.<b>paddingLeft</b>([<i>padding</i>]) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/index.js#L89 "Source")

If *padding* is specified, sets the left padding to the specified number or function and returns this treemap layout. If *padding* is not specified, returns the current left padding function, which defaults to the constant zero. If *padding* is a function, it is invoked for each node with children, being passed the current node. The left padding is used to separate the left edge of a node from its children.

#### Treemap Tiling

Several built-in tiling methods are provided for use with [*treemap*.tile](#treemap_tile).

<a name="treemapBinary" href="#treemapBinary">#</a> d3.<b>treemapBinary</b>(<i>node</i>, <i>x0</i>, <i>y0</i>, <i>x1</i>, <i>y1</i>) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/binary.js "Source")

Recursively partitions the specified *nodes* into an approximately-balanced binary tree, choosing horizontal partitioning for wide rectangles and vertical partitioning for tall rectangles.

<a name="treemapDice" href="#treemapDice">#</a> d3.<b>treemapDice</b>(<i>node</i>, <i>x0</i>, <i>y0</i>, <i>x1</i>, <i>y1</i>) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/dice.js "Source")

Divides the rectangular area specified by *x0*, *y0*, *x1*, *y1* horizontally according the value of each of the specified *node*’s children. The children are positioned in order, starting with the left edge (*x0*) of the given rectangle. If the sum of the children’s values is less than the specified *node*’s value (*i.e.*, if the specified *node* has a non-zero internal value), the remaining empty space will be positioned on the right edge (*x1*) of the given rectangle.

<a name="treemapSlice" href="#treemapSlice">#</a> d3.<b>treemapSlice</b>(<i>node</i>, <i>x0</i>, <i>y0</i>, <i>x1</i>, <i>y1</i>) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/slice.js "Source")

Divides the rectangular area specified by *x0*, *y0*, *x1*, *y1* vertically according the value of each of the specified *node*’s children. The children are positioned in order, starting with the top edge (*y0*) of the given rectangle. If the sum of the children’s values is less than the specified *node*’s value (*i.e.*, if the specified *node* has a non-zero internal value), the remaining empty space will be positioned on the bottom edge (*y1*) of the given rectangle.

<a name="treemapSliceDice" href="#treemapSliceDice">#</a> d3.<b>treemapSliceDice</b>(<i>node</i>, <i>x0</i>, <i>y0</i>, <i>x1</i>, <i>y1</i>) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/sliceDice.js "Source")

If the specified *node* has odd depth, delegates to [treemapSlice](#treemapSlice); otherwise delegates to [treemapDice](#treemapDice).

<a name="treemapSquarify" href="#treemapSquarify">#</a> d3.<b>treemapSquarify</b>(<i>node</i>, <i>x0</i>, <i>y0</i>, <i>x1</i>, <i>y1</i>) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/squarify.js "Source")

Implements the [squarified treemap](https://www.win.tue.nl/~vanwijk/stm.pdf) algorithm by Bruls *et al.*, which seeks to produce rectangles of a given [aspect ratio](#squarify_ratio).

<a name="treemapResquarify" href="#treemapResquarify">#</a> d3.<b>treemapResquarify</b>(<i>node</i>, <i>x0</i>, <i>y0</i>, <i>x1</i>, <i>y1</i>) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/resquarify.js "Source")

Like [d3.treemapSquarify](#treemapSquarify), except preserves the topology (node adjacencies) of the previous layout computed by d3.treemapResquarify, if there is one and it used the same [target aspect ratio](#squarify_ratio). This tiling method is good for animating changes to treemaps because it only changes node sizes and not their relative positions, thus avoiding distracting shuffling and occlusion. The downside of a stable update, however, is a suboptimal layout for subsequent updates: only the first layout uses the Bruls *et al.* squarified algorithm.

<a name="squarify_ratio" href="#squarify_ratio">#</a> <i>squarify</i>.<b>ratio</b>(<i>ratio</i>) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/squarify.js#L58 "Source")

Specifies the desired aspect ratio of the generated rectangles. The *ratio* must be specified as a number greater than or equal to one. Note that the orientation of the generated rectangles (tall or wide) is not implied by the ratio; for example, a ratio of two will attempt to produce a mixture of rectangles whose *width*:*height* ratio is either 2:1 or 1:2. (However, you can approximately achieve this result by generating a square treemap at different dimensions, and then [stretching the treemap](http://bl.ocks.org/mbostock/5c50a377e76a1974248bd628befdec95) to the desired aspect ratio.) Furthermore, the specified *ratio* is merely a hint to the tiling algorithm; the rectangles are not guaranteed to have the specified aspect ratio. If not specified, the aspect ratio defaults to the golden ratio, φ = (1 + sqrt(5)) / 2, per [Kong *et al.*](http://vis.stanford.edu/papers/perception-treemaps)

### Partition

[<img alt="Partition" src="https://raw.githubusercontent.com/d3/d3-hierarchy/master/img/partition.png">](http://bl.ocks.org/mbostock/2e73ec84221cb9773f4c)

The **partition layout** produces adjacency diagrams: a space-filling variant of a node-link tree diagram. Rather than drawing a link between parent and child in the hierarchy, nodes are drawn as solid areas (either arcs or rectangles), and their placement relative to other nodes reveals their position in the hierarchy. The size of the nodes encodes a quantitative dimension that would be difficult to show in a node-link diagram.

<a name="partition" href="#partition">#</a> d3.<b>partition</b>()

Creates a new partition layout with the default settings.

<a name="_partition" href="#_partition">#</a> <i>partition</i>(<i>root</i>) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/partition.js#L10 "Source")

Lays out the specified *root* [hierarchy](#hierarchy), assigning the following properties on *root* and its descendants:

* *node*.x0 - the left edge of the rectangle
* *node*.y0 - the top edge of the rectangle
* *node*.x1 - the right edge of the rectangle
* *node*.y1 - the bottom edge of the rectangle

You must call [*root*.sum](#node_sum) before passing the hierarchy to the partition layout. You probably also want to call [*root*.sort](#node_sort) to order the hierarchy before computing the layout.

<a name="partition_size" href="#partition_size">#</a> <i>partition</i>.<b>size</b>([<i>size</i>]) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/partition.js#L43 "Source")

If *size* is specified, sets this partition layout’s size to the specified two-element array of numbers [*width*, *height*] and returns this partition layout. If *size* is not specified, returns the current size, which defaults to [1, 1].

<a name="partition_round" href="#partition_round">#</a> <i>partition</i>.<b>round</b>([<i>round</i>]) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/partition.js#L39 "Source")

If *round* is specified, enables or disables rounding according to the given boolean and returns this partition layout. If *round* is not specified, returns the current rounding state, which defaults to false.

<a name="partition_padding" href="#partition_padding">#</a> <i>partition</i>.<b>padding</b>([<i>padding</i>]) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/partition.js#L47 "Source")

If *padding* is specified, sets the padding to the specified number and returns this partition layout. If *padding* is not specified, returns the current padding, which defaults to zero. The padding is used to separate a node’s adjacent children.

### Pack

[<img alt="Circle-Packing" src="https://raw.githubusercontent.com/d3/d3-hierarchy/master/img/pack.png">](http://bl.ocks.org/mbostock/ca5b03a33affa4160321)

Enclosure diagrams use containment (nesting) to represent a hierarchy. The size of the leaf circles encodes a quantitative dimension of the data. The enclosing circles show the approximate cumulative size of each subtree, but due to wasted space there is some distortion; only the leaf nodes can be compared accurately. Although [circle packing](http://en.wikipedia.org/wiki/Circle_packing) does not use space as efficiently as a [treemap](#treemap), the “wasted” space more prominently reveals the hierarchical structure.

<a name="pack" href="#pack">#</a> d3.<b>pack</b>()

Creates a new pack layout with the default settings.

<a name="_pack" href="#_pack">#</a> <i>pack</i>(<i>root</i>) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/pack/index.js#L15 "Source")

Lays out the specified *root* [hierarchy](#hierarchy), assigning the following properties on *root* and its descendants:

* *node*.x - the *x*-coordinate of the circle’s center
* *node*.y - the *y*-coordinate of the circle’s center
* *node*.r - the radius of the circle

You must call [*root*.sum](#node_sum) before passing the hierarchy to the pack layout. You probably also want to call [*root*.sort](#node_sort) to order the hierarchy before computing the layout.

<a name="pack_radius" href="#pack_radius">#</a> <i>pack</i>.<b>radius</b>([<i>radius</i>]) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/pack/index.js#L30 "Source")

If *radius* is specified, sets the pack layout’s radius accessor to the specified function and returns this pack layout. If *radius* is not specified, returns the current radius accessor, which defaults to null. If the radius accessor is null, the radius of each leaf circle is derived from the leaf *node*.value (computed by [*node*.sum](#node_sum)); the radii are then scaled proportionally to fit the [layout size](#pack_size). If the radius accessor is not null, the radius of each leaf circle is specified exactly by the function.

<a name="pack_size" href="#pack_size">#</a> <i>pack</i>.<b>size</b>([<i>size</i>]) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/pack/index.js#L34 "Source")

If *size* is specified, sets this pack layout’s size to the specified two-element array of numbers [*width*, *height*] and returns this pack layout. If *size* is not specified, returns the current size, which defaults to [1, 1].

<a name="pack_padding" href="#pack_padding">#</a> <i>pack</i>.<b>padding</b>([<i>padding</i>]) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/pack/index.js#L38 "Source")

If *padding* is specified, sets this pack layout’s padding accessor to the specified number or function and returns this pack layout. If *padding* is not specified, returns the current padding accessor, which defaults to the constant zero. When siblings are packed, tangent siblings will be separated by approximately the specified padding; the enclosing parent circle will also be separated from its children by approximately the specified padding. If an [explicit radius](#pack_radius) is not specified, the padding is approximate because a two-pass algorithm is needed to fit within the [layout size](#pack_size): the circles are first packed without padding; a scaling factor is computed and applied to the specified padding; and lastly the circles are re-packed with padding.

<a name="packSiblings" href="#packSiblings">#</a> d3.<b>packSiblings</b>(<i>circles</i>) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/pack/siblings.js "Source")

Packs the specified array of *circles*, each of which must have a *circle*.r property specifying the circle’s radius. Assigns the following properties to each circle:

* *circle*.x - the *x*-coordinate of the circle’s center
* *circle*.y - the *y*-coordinate of the circle’s center

The circles are positioned according to the front-chain packing algorithm by [Wang *et al.*](https://dl.acm.org/citation.cfm?id=1124851)

<a name="packEnclose" href="#packEnclose">#</a> d3.<b>packEnclose</b>(<i>circles</i>) [<>](https://github.com/d3/d3-hierarchy/blob/master/src/pack/enclose.js "Source")

Computes the [smallest circle](https://en.wikipedia.org/wiki/Smallest-circle_problem) that encloses the specified array of *circles*, each of which must have a *circle*.r property specifying the circle’s radius, and *circle*.x and *circle*.y properties specifying the circle’s center. The enclosing circle is computed using the [Matoušek-Sharir-Welzl algorithm](http://www.inf.ethz.ch/personal/emo/PublFiles/SubexLinProg_ALG16_96.pdf). (See also [Apollonius’ Problem](https://bl.ocks.org/mbostock/751fdd637f4bc2e3f08b).)
