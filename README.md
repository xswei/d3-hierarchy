# d3-hierarchy

许多数据集从从本质上是嵌套结构的。考虑在 [geographic entities](https://www.census.gov/geo/reference/hierarchy.html) 应用场景中，比如人口普查，人口结构以及国家和州；企业和政府的组织结构；文件系统和软件包。甚至非层级的数据也可以被组合成层级数据结构，比如 [*k*-means clustering(*k* - means 聚类)](https://en.wikipedia.org/wiki/K-means_clustering) or [phylogenetic trees (生态系统树)](https://bl.ocks.org/mbostock/c034d66572fd6bd6815a)。

这个模块实现了几种经典的对层次结构数据的可视化技术：

**Node-link diagrams**(节点-链接图) 对节点和边使用离散的标记来展示拓扑结构，比如节点展示为圆并且父子节点之间使用线连接。[“tidy” tree](#tree) 结构更紧密，而 [dendrogram(系统树)](#cluster) 则将所有的叶节点放置在同一水平线上。(它们都有极坐标系和笛卡尔坐标系两种形式。) [Indented trees(缩进树)](https://bl.ocks.org/mbostock/1093025) 对交互式展示很有用。

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

<a name="hierarchy" href="#hierarchy">#</a> d3.<b>hierarchy</b>(<i>data</i>[, <i>children</i>]) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/hierarchy/index.js#L12 "Source")

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

<a name="node_ancestors" href="#node_ancestors">#</a> <i>node</i>.<b>ancestors</b>() [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/hierarchy/ancestors.js "Source")

返回祖先节点数组，第一个节点为自身，然后依次为从自身到根节点的所有节点。

<a name="node_descendants" href="#node_descendants">#</a> <i>node</i>.<b>descendants</b>() [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/hierarchy/descendants.js "Source")

返回后代节点数组，第一个节点为自身，然后依次为所有子节点的拓扑排序。

<a name="node_leaves" href="#node_leaves">#</a> <i>node</i>.<b>leaves</b>() [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/hierarchy/leaves.js "Source")

返回叶节点数组，叶节点是没有孩子节点的节点。

<a name="node_path" href="#node_path">#</a> <i>node</i>.<b>path</b>(<i>target</i>) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/hierarchy/path.js "Source")

返回从当前 *node* 到指定 *target* 节点的最短路径。路径从当前节点开始，遍历到当前 *node* 和 *target* 节点共同最近祖先，然后到 *target* 节点。这个方法对 [hierarchical edge bundling](https://bl.ocks.org/mbostock/7607999)(分层边捆绑) 很有用。

<a name="node_links" href="#node_links">#</a> <i>node</i>.<b>links</b>() [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/hierarchy/links.js "Source")

返回当前 *node* 的 `links` 数组, 其中每个 *link* 是一个定义了 *source* 和 *target* 属性的对象。每个 `link` 的 `source` 为父节点, `target` 为子节点。

<a name="node_sum" href="#node_sum">#</a> <i>node</i>.<b>sum</b>(<i>value</i>) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/hierarchy/sum.js "Source")

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

<a name="node_count" href="#node_count">#</a> <i>node</i>.<b>count</b>() [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/hierarchy/count.js "Source")

计算当前 *node* 下所有叶节点的数量，并将其分配到 *node*.value 属性, 同时该节点的所有后代节点也会被自动计算其所属下的所有叶节点数量。如果 *node* 为叶节点则 `count` 为 `1`。该操作返回当前 *node*。对比 [*node*.sum](#node_sum)。

<a name="node_sort" href="#node_sort">#</a> <i>node</i>.<b>sort</b>(<i>compare</i>) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/hierarchy/sort.js "Source")

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

<a name="node_each" href="#node_each">#</a> <i>node</i>.<b>each</b>(<i>function</i>) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/hierarchy/each.js "Source")

以 [breadth-first order](https://en.wikipedia.org/wiki/Breadth-first_search)(广度优先) 的次序为每个 *node* 调用执行的 *function*, 一个给定的节点只有在比其深度更小或者在此节点之前的相同深度的节点都被访问过之后才会被访问。指定的函数会将当前 *node* 作为参数。

<a name="node_eachAfter" href="#node_eachAfter">#</a> <i>node</i>.<b>eachAfter</b>(<i>function</i>) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/hierarchy/eachAfter.js "Source")

以 [post-order traversal](https://en.wikipedia.org/wiki/Tree_traversal#Post-order)(后序遍历) 的次序为每个 *node* 调用执行的 *function*，当每个节点被访问前，其所有的后代节点都已经被访问过。指定的函数会将当前 *node* 作为参数。

<a name="node_eachBefore" href="#node_eachBefore">#</a> <i>node</i>.<b>eachBefore</b>(<i>function</i>) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/hierarchy/eachBefore.js "Source")

以 [pre-order traversal](https://en.wikipedia.org/wiki/Tree_traversal#Pre-order)(前序遍历) 的次序为每个 *node* 调用执行的 *function*，当每个节点被访问前，其所有的祖先节点都已经被访问过。指定的函数会将当前 *node* 作为参数。

<a name="node_copy" href="#node_copy">#</a> <i>node</i>.<b>copy</b>() [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/hierarchy/index.js#L39 "Source")

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

<a name="stratify" href="#stratify">#</a> d3.<b>stratify</b>() [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/stratify.js "Source")

使用默认的配置构造一个新的 `stratify`(分层) 操作。

<a name="_stratify" href="#_stratify">#</a> <i>stratify</i>(<i>data</i>) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/stratify.js#L20 "Source")

根据执行的扁平 *data* 生成一个新的层次结构数据.

<a name="stratify_id" href="#stratify_id">#</a> <i>stratify</i>.<b>id</b>([<i>id</i>]) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/stratify.js#L64 "Source")

如果指定了 *id*, 则将 `id` 访问器设置为指定的函数并返回分层操作。否则返回当前的 `id` 访问器, 默认为:

```js
function id(d) {
  return d.id;
}
```

`id` 访问器会为每个输入到 [stratify operator](#_stratify) 的数据元素进行调用，并传递当前数据 *d* 以及当前索引 *i*. 返回的字符串会被用来识别节点与 [parent id](#stratify_parentId)(父节点 `id`) 之间的关系。对于叶节点，`id` 可能是 `undefined`; 此外 `id` 必须是唯一的。(`Null` 和空字符串等价于 `undefined`).

<a name="stratify_parentId" href="#stratify_parentId">#</a> <i>stratify</i>.<b>parentId</b>([<i>parentId</i>]) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/stratify.js#L68 "Source")

如果指定了 *parentId*，则将当前父节点 `id` 访问器设置为给定的函数，并返回分层操作。否则返回当前父节点 `id` 访问器, 默认为:

```js
function parentId(d) {
  return d.parentId;
}
```

父节点 `id` 访问器会为每个输入的元素进行调用，并传递当前元素 *d* 以及当前索引 *i*. 返回的字符串用来识别节点与 [id](#stratify_id) 的关系。对于根节点, 其父节点 `id` 应该为 `undefined`。(`Null` 和空字符串等价于 `undefined`)。输入数据必须有一个根节点并且没有循环引用关系。

### Cluster

[<img alt="Dendrogram" src="https://raw.githubusercontent.com/d3/d3-hierarchy/master/img/cluster.png">](http://bl.ocks.org/mbostock/ff91c1558bc570b08539547ccc90050b)

**cluster layout** 布局用来生成 [dendrograms(系统树)](http://en.wikipedia.org/wiki/Dendrogram)：节点-连接图中所有的叶节点都放在相同的深度上。`Dendograms` 通常不如 [tidy trees](#tree) 紧凑，但是当所有的叶子都在同一水平时是有用的，比如分层聚类或 [phylogenetic tree diagrams(系统树图)](http://bl.ocks.org/mbostock/c034d66572fd6bd6815a)。

<a name="cluster" href="#cluster">#</a> d3.<b>cluster</b>() [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/cluster.js "Source")

使用默认的配置创建一个新的系统树布局.

<a name="_cluster" href="#_cluster">#</a> <i>cluster</i>(<i>root</i>) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/cluster.js#L39 "Source")

对指定的 *root* [hierarchy](#hierarchy) 进行布局，并为 *root* 以及它的每一个后代附加两个属性:

* *node*.x - 节点的 *x*- 坐标
* *node*.y - 节点的 *y*- 坐标

节点的 *x* 和 *y* 坐标可以是任意的坐标系统；例如你可以将 *x* 视为角度而将 *y* 视为半径来生成一个 [radial layout(径向布局)](http://bl.ocks.org/mbostock/4739610f6d96aaad2fb1e78a72b385ab)。你也可以在布局之前使用 [*root*.sort](#node_sort) 进行排序操作。

<a name="cluster_size" href="#cluster_size">#</a> <i>cluster</i>.<b>size</b>([<i>size</i>]) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/cluster.js#L75 "Source")

如果指定了 *size* 则设置当前系统树布局的尺寸为一个指定的二元数值类型数组，表示 [*width*, *height*] 并返回当前系统树布局。如果 *size* 没有指定则返回当前系统树布局的尺寸，默认为 [1, 1]。如果返回的布局尺寸为 `null` 时则表示实际的尺寸根据 [node size](#cluster_nodeSize) 确定。坐标 *x* 和 *y* 可以是任意的坐标系统；例如如果要生成一个 [radial layout(径向布局)](http://bl.ocks.org/mbostock/4739610f6d96aaad2fb1e78a72b385ab) 则可以将其设置为 [360, *radius*] 用以表示角度范围为 `360°` 并且半径范围为 *radius*。

<a name="cluster_nodeSize" href="#cluster_nodeSize">#</a> <i>cluster</i>.<b>nodeSize</b>([<i>size</i>]) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/cluster.js#L79 "Source")

如果指定了 *size* 则设置系统树布局的节点尺寸为指定的数值二元数组，表示为 [*width*, *height*] 并返回当前系统树布局。如果没有指定 *size* 则返回当前节点尺寸，默认为 `null`。如果返回的尺寸为 `null` 则表示使用 [layout size](#cluster_size) 来自动计算节点大小。当指定了节点尺寸时，根节点的位置总是位于 ⟨0, 0⟩。

<a name="cluster_separation" href="#cluster_separation">#</a> <i>cluster</i>.<b>separation</b>([<i>separation</i>]) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/cluster.js#L71 "Source")

如果指定了 *seperation*, 则设置间隔访问器为指定的函数并返回当前系统树布局。如果没有指定 *seperation* 则返回当前的间隔访问器，默认为:

```js
function separation(a, b) {
  return a.parent == b.parent ? 1 : 2;
}
```

间隔访问器用来设置相邻的两个叶节点之间的间隔。指定的间隔访问器会传递两个叶节点 *a* 和 *b*，并且必须返回一个期望的间隔值。这些节点通常是兄弟节点，如果布局将两个节点放置到相邻的位置，则可以通过配置间隔访问器设置相邻节点之间的间隔控制其期望的距离。

### Tree

[<img alt="Tidy Tree" src="https://raw.githubusercontent.com/d3/d3-hierarchy/master/img/tree.png">](http://bl.ocks.org/mbostock/9d0899acb5d3b8d839d9d613a9e1fe04)

**tree** 布局基于 [Reingold–Tilford “tidy” algorithm](http://reingold.co/tidier-drawings.pdf) 用来生成节点-链接树，由 [Buchheim *et al.*](http://dirk.jivas.de/papers/buchheim02improving.pdf) 等人进行了时间上的优化，紧凑树布局比 [dendograms](#cluster) 空间上看来更紧凑。

<a name="tree" href="#tree">#</a> d3.<b>tree</b>() [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/tree.js "Source")

使用默认的设置创建一个新的树布局。

<a name="_tree" href="#_tree">#</a> <i>tree</i>(<i>root</i>) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/tree.js#L106 "Source")

对指定的 *root* [hierarchy](#hierarchy) 进行布局，并为 *root* 以及它的每一个后代附加两个属性:

* *node*.x - 节点的 *x*- 坐标
* *node*.y - 节点的 *y*- 坐标

节点的 *x* 和 *y* 坐标可以是任意的坐标系统；例如你可以将 *x* 视为角度而将 *y* 视为半径来生成一个 [radial layout(径向布局)](http://bl.ocks.org/mbostock/2e12b0bd732e7fe4000e2d11ecab0268)。你也可以在布局之前使用 [*root*.sort](#node_sort) 进行排序操作。

<a name="tree_size" href="#tree_size">#</a> <i>tree</i>.<b>size</b>([<i>size</i>]) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/tree.js#L228 "Source")

如果指定了 *size* 则设置当前系统树布局的尺寸为一个指定的二元数值类型数组，表示 [*width*, *height*] 并返回当前树布局。如果 *size* 没有指定则返回当前系统树布局的尺寸，默认为 [1, 1]。如果返回的布局尺寸为 `null` 时则表示实际的尺寸根据 [node size](#tree_nodeSize) 确定。坐标 *x* 和 *y* 可以是任意的坐标系统；例如如果要生成一个 [radial layout(径向布局)](http://bl.ocks.org/mbostock/2e12b0bd732e7fe4000e2d11ecab0268) 则可以将其设置为 [360, *radius*] 用以表示角度范围为 `360°` 并且半径范围为 *radius*。

<a name="tree_nodeSize" href="#tree_nodeSize">#</a> <i>tree</i>.<b>nodeSize</b>([<i>size</i>]) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/tree.js#L232 "Source")

如果指定了 *size* 则设置系统树布局的节点尺寸为指定的数值二元数组，表示为 [*width*, *height*] 并返回当前树布局。如果没有指定 *size* 则返回当前节点尺寸，默认为 `null`。如果返回的尺寸为 `null` 则表示使用 [layout size](#tree_size) 来自动计算节点大小。当指定了节点尺寸时，根节点的位置总是位于 ⟨0, 0⟩。

<a name="tree_separation" href="#tree_separation">#</a> <i>tree</i>.<b>separation</b>([<i>separation</i>]) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/tree.js#L224 "Source")

如果指定了 *seperation*, 则设置间隔访问器为指定的函数并返回当前树布局。如果没有指定 *seperation* 则返回当前的间隔访问器，默认为:

```js
function separation(a, b) {
  return a.parent == b.parent ? 1 : 2;
}
```

一种更适合于径向布局的变体，可以按比例缩小半径差距:

```js
function separation(a, b) {
  return (a.parent == b.parent ? 1 : 2) / a.depth;
}
```

间隔访问器用来设置相邻的两个节点之间的间隔。指定的间隔访问器会传递两个节点 *a* 和 *b*，并且必须返回一个期望的间隔值。这些节点通常是兄弟节点，如果布局将两个节点放置到相邻的位置，则可以通过配置间隔访问器设置相邻节点之间的间隔控制其期望的距离。

### Treemap

[<img alt="Treemap" src="https://raw.githubusercontent.com/d3/d3-hierarchy/master/img/treemap.png">](http://bl.ocks.org/mbostock/6bbb0a7ff7686b124d80)

参考 1991年 [Ben Shneiderman](http://www.cs.umd.edu/hcil/treemap-history/) 的介绍，**treemap** 根据每个节点的值递归的将区域划分为矩形。`D3` 的 `treemap` 的实现支持可扩展的 [tiling method(铺设方法)](#treemap_tile)：默认的 [squarified](#treemapSquarify) 方法生成的矩形长宽比例遵从 [golden(黄金比例)](https://en.wikipedia.org/wiki/Golden_ratio)；此外还提供了比 [slice-and-dice](#treemapSliceDice) 更具有可读性和尺寸估计的铺设方法，也就是只在水平或者垂直方向按照深度划分。

<a name="treemap" href="#treemap">#</a> d3.<b>treemap</b>()

使用默认的配置创建一个新的 `treemap` 布局。

<a name="_treemap" href="#_treemap">#</a> <i>treemap</i>(<i>root</i>) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/index.js#L18 "Source")

对指定的 *root* [hierarchy](#hierarchy) 进行布局，为 *root* 以及每个后代节点附加以下属性:

* *node*.x0 - 矩形的左边缘
* *node*.y0 - 矩形的上边缘
* *node*.x1 - 矩形的右边缘
* *node*.y1 - 矩形的下边缘

在将层次数据传递给 `treemap` 布局之前，必须调用 [*root*.sum](#node_sum)。在计算布局之前还可能需要调用 [*root*.sort](#node_sort) 对节点进行排序。

<a name="treemap_tile" href="#treemap_tile">#</a> <i>treemap</i>.<b>tile</b>([<i>tile</i>]) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/index.js#L61 "Source")

如果指定了 *tile* 则设置 [tiling method](#treemap-tiling) 为指定的函数并返回当前 `treemap` 布局。如果没有指定 *tile* 则返回当前铺设方法，默认为 [d3.treemapSquarify](#treemapSquarify)，也就是切分的矩形的长宽比遵循黄金比例。

<a name="treemap_size" href="#treemap_size">#</a> <i>treemap</i>.<b>size</b>([<i>size</i>]) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/index.js#L57 "Source")

如果指定了 *size* 则将当前的布局尺寸设置为指定的二元数值数组：[*width*, *height*]，并返回当前 `treemap` 布局。如果没有指定 *size* 则返回当前尺寸，默认为 [1, 1]。

<a name="treemap_round" href="#treemap_round">#</a> <i>treemap</i>.<b>round</b>([<i>round</i>]) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/index.js#L53 "Source")

如果指定了 *round* 则根据指定的布尔类型值启用或禁用四舍五入，并返回当前 `treemap` 布局。如果 *round* 没有指定则返回当前 `rounding` 状态，默认为 `false`。

<a name="treemap_padding" href="#treemap_padding">#</a> <i>treemap</i>.<b>padding</b>([<i>padding</i>]) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/index.js#L65 "Source")

如果指定了 *padding* 则同时设置 [inner](#treemap_paddingInner) 和 [outer](#treemap_paddingOuter) 间隔为指定的数值或函数，并返回当前 `treemap` 布局。如果没有指定 *padding* 则返回当前的 `inner` 间隔函数。

<a name="treemap_paddingInner" href="#treemap_paddingInner">#</a> <i>treemap</i>.<b>paddingInner</b>([<i>padding</i>]) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/index.js#L69 "Source")

如果指定了 *padding* 则将当前 `inner` 间隔设置为指定的数值或函数并返回当前的 `treemap` 布局。如果 *padding* 没有指定则返回当前 `inner` 间隔函数，默认为常数 `0`。如果 `padding` 为函数则会为每个包含子节点的节点调用并传递当前节点。`inner` 间隔用来设置节点相邻两个子节点之间的间隔。

<a name="treemap_paddingOuter" href="#treemap_paddingOuter">#</a> <i>treemap</i>.<b>paddingOuter</b>([<i>padding</i>]) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/index.js#L73 "Source")

如果指定了 *padding* 则将 [top](#treemap_paddingTop), [right](#treemap_paddingRight), [bottom](#treemap_paddingBottom) 和 [left](#treemap_paddingLeft) 间隔设置为指定的数值或函数，并返回当前 `treemap` 布局，如果没有指定 *padding* 则返回当前 `top` 间隔函数。

<a name="treemap_paddingTop" href="#treemap_paddingTop">#</a> <i>treemap</i>.<b>paddingTop</b>([<i>padding</i>]) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/index.js#L77 "Source")

如果指定了 *padding* 则将 `top` 间隔设置为指定的数值或函数并返回当前 `treemap` 布局。如果没有指定 `padding` 则返回当前 `top` 间隔函数，默认为常量 `0`。如果 `padding` 为会为每个包含子节点的节点调用并传递当前节点。`top` 间隔用来将节点的顶部边缘与其子节点分开。

<a name="treemap_paddingRight" href="#treemap_paddingRight">#</a> <i>treemap</i>.<b>paddingRight</b>([<i>padding</i>]) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/index.js#L81 "Source")

如果指定了 *padding* 则将 `right` 间隔设置为指定的数值或函数并返回当前 `treemap` 布局。如果没有指定 `padding` 则返回当前 `right` 间隔函数，默认为常量 `0`。如果 `padding` 为会为每个包含子节点的节点调用并传递当前节点。`right` 间隔用来将节点的右侧边缘与其子节点分开。

<a name="treemap_paddingBottom" href="#treemap_paddingBottom">#</a> <i>treemap</i>.<b>paddingBottom</b>([<i>padding</i>]) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/index.js#L85 "Source")

如果指定了 *padding* 则将 `bottom` 间隔设置为指定的数值或函数并返回当前 `treemap` 布局。如果没有指定 `padding` 则返回当前 `bottom` 间隔函数，默认为常量 `0`。如果 `padding` 为会为每个包含子节点的节点调用并传递当前节点。`bottom` 间隔用来将节点的下侧边缘与其子节点分开。

<a name="treemap_paddingLeft" href="#treemap_paddingLeft">#</a> <i>treemap</i>.<b>paddingLeft</b>([<i>padding</i>]) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/index.js#L89 "Source")

如果指定了 *padding* 则将 `left` 间隔设置为指定的数值或函数并返回当前 `treemap` 布局。如果没有指定 `padding` 则返回当前 `left` 间隔函数，默认为常量 `0`。如果 `padding` 为会为每个包含子节点的节点调用并传递当前节点。`left` 间隔用来将节点的左侧边缘与其子节点分开。

#### Treemap Tiling

几种内置的铺设方法，用来供 [*treemap*.tile](#treemap_tile) 使用。

<a name="treemapBinary" href="#treemapBinary">#</a> d3.<b>treemapBinary</b>(<i>node</i>, <i>x0</i>, <i>y0</i>, <i>x1</i>, <i>y1</i>) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/binary.js "Source")

递归地将指定的 *nodes* 划分为一个近似平衡的二叉树，宽矩形进行水平分割和高矩形进行垂直分割。

<a name="treemapDice" href="#treemapDice">#</a> d3.<b>treemapDice</b>(<i>node</i>, <i>x0</i>, <i>y0</i>, <i>x1</i>, <i>y1</i>) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/dice.js "Source")

Divides the rectangular area specified by *x0*, *y0*, *x1*, *y1* horizontally according the value of each of the specified *node*’s children. The children are positioned in order, starting with the left edge (*x0*) of the given rectangle. If the sum of the children’s values is less than the specified *node*’s value (*i.e.*, if the specified *node* has a non-zero internal value), the remaining empty space will be positioned on the right edge (*x1*) of the given rectangle.

<a name="treemapSlice" href="#treemapSlice">#</a> d3.<b>treemapSlice</b>(<i>node</i>, <i>x0</i>, <i>y0</i>, <i>x1</i>, <i>y1</i>) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/slice.js "Source")

Divides the rectangular area specified by *x0*, *y0*, *x1*, *y1* vertically according the value of each of the specified *node*’s children. The children are positioned in order, starting with the top edge (*y0*) of the given rectangle. If the sum of the children’s values is less than the specified *node*’s value (*i.e.*, if the specified *node* has a non-zero internal value), the remaining empty space will be positioned on the bottom edge (*y1*) of the given rectangle.

<a name="treemapSliceDice" href="#treemapSliceDice">#</a> d3.<b>treemapSliceDice</b>(<i>node</i>, <i>x0</i>, <i>y0</i>, <i>x1</i>, <i>y1</i>) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/sliceDice.js "Source")

If the specified *node* has odd depth, delegates to [treemapSlice](#treemapSlice); otherwise delegates to [treemapDice](#treemapDice).

<a name="treemapSquarify" href="#treemapSquarify">#</a> d3.<b>treemapSquarify</b>(<i>node</i>, <i>x0</i>, <i>y0</i>, <i>x1</i>, <i>y1</i>) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/squarify.js "Source")

实现了由 `Bruls` *et al.* 等人提出的 [squarified treemap](https://www.win.tue.nl/~vanwijk/stm.pdf)，这种铺设方法会尽可能的使用指定的 [aspect ratio(纵横比))](#squarify_ratio) 来切分矩形。

<a name="treemapResquarify" href="#treemapResquarify">#</a> d3.<b>treemapResquarify</b>(<i>node</i>, <i>x0</i>, <i>y0</i>, <i>x1</i>, <i>y1</i>) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/resquarify.js "Source")

Like [d3.treemapSquarify](#treemapSquarify), except preserves the topology (node adjacencies) of the previous layout computed by d3.treemapResquarify, if there is one and it used the same [target aspect ratio](#squarify_ratio). This tiling method is good for animating changes to treemaps because it only changes node sizes and not their relative positions, thus avoiding distracting shuffling and occlusion. The downside of a stable update, however, is a suboptimal layout for subsequent updates: only the first layout uses the Bruls *et al.* squarified algorithm.

<a name="squarify_ratio" href="#squarify_ratio">#</a> <i>squarify</i>.<b>ratio</b>(<i>ratio</i>) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/treemap/squarify.js#L58 "Source")

指定期望矩形的纵横比。*ratio* 必须为大于等于 `1` 的数值。请注意，生成的矩形（高或宽）的方向不是由比率所暗示的; 例如，比率为 `2` 时生成的矩形的长宽比为 `1:2` 或者为 `2:1`(但是，你可以通过在不同的维度上生成一个正方形 `treemap` 来实现这个结果，然后将 `treemap` [stretching the treemap](http://bl.ocks.org/mbostock/5c50a377e76a1974248bd628befdec95) 到所需的纵横比)。此外指定的长宽比仅仅是一个期望值，实际计算不能保证。如果没有指定的话，默认的纵横比为黄金比例：φ = (1 + sqrt(5)) / 2。

### Partition

[<img alt="Partition" src="https://raw.githubusercontent.com/d3/d3-hierarchy/master/img/partition.png">](http://bl.ocks.org/mbostock/2e73ec84221cb9773f4c)

**partition layout** 用来生成邻接图：一个节点链接树图的空间填充变体。与使用连线链接节点与父节点不同，在这个布局中节点会被绘制为一个区域(可以是弧也可以是矩形)，并且其位置反应了其在层次结构中的相对位置。节点的尺寸被编码为一个可度量的维度，这个在节点-链接图中很难表示。

<a name="partition" href="#partition">#</a> d3.<b>partition</b>()

使用默认的设置创建一个分区图布局。

<a name="_partition" href="#_partition">#</a> <i>partition</i>(<i>root</i>) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/partition.js#L10 "Source")

对指定的 *root* [hierarchy](#hierarchy) 进行布局，*root* 节点以及每个后代节点会被附加以下属性:

* *node*.x0 - 矩形的左边缘
* *node*.y0 - 矩形的上边缘
* *node*.x1 - 矩形的右边缘
* *node*.y1 - 矩形的下边缘

在将层次数据传递给 `treemap` 布局之前，必须调用 [*root*.sum](#node_sum)。在计算布局之前还可能需要调用 [*root*.sort](#node_sort) 对节点进行排序。

<a name="partition_size" href="#partition_size">#</a> <i>partition</i>.<b>size</b>([<i>size</i>]) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/partition.js#L43 "Source")

如果指定了 *size* 则将当前的布局尺寸设置为指定的二元数值数组：[*width*, *height*]，并返回当前 `treemap` 布局。如果没有指定 *size* 则返回当前尺寸，默认为 [1, 1]。

<a name="partition_round" href="#partition_round">#</a> <i>partition</i>.<b>round</b>([<i>round</i>]) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/partition.js#L39 "Source")

如果指定了 *round* 则根据指定的布尔类型值启用或禁用四舍五入，并返回当前 `treemap` 布局。如果 *round* 没有指定则返回当前 `rounding` 状态，默认为 `false`。

<a name="partition_padding" href="#partition_padding">#</a> <i>partition</i>.<b>padding</b>([<i>padding</i>]) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/partition.js#L47 "Source")

如果指定了 *padding* 则设将当前分区布局的间隔设置为指定的数值或函数，并返回当前 `partition` 布局。如果没有指定 *padding* 则返回当前的间隔，默认为 `0`。间隔用于分离节点的相邻子节点。

### Pack

[<img alt="Circle-Packing" src="https://raw.githubusercontent.com/d3/d3-hierarchy/master/img/pack.png">](http://bl.ocks.org/mbostock/ca5b03a33affa4160321)

`Enclosure(打包)` 图使用嵌套来表示层次结构。最里层表示叶节点的圆的大小用来编码定量的维度值。每个圆都表示当前节点的近似累计大小，因为有空间浪费以及变形；仅仅只有叶节点可以准确的比较。尽管 [circle packing](http://en.wikipedia.org/wiki/Circle_packing) 与 [treemap](#treemap) 相比不能高效的利用空间，但是能更突出的表示层次结构。

<a name="pack" href="#pack">#</a> d3.<b>pack</b>()

使用默认的设置创建一个打包布局。

<a name="_pack" href="#_pack">#</a> <i>pack</i>(<i>root</i>) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/pack/index.js#L15 "Source")

对 *root* [hierarchy](#hierarchy) 进行布局，*root* 节点以及每个后代节点会被附加以下属性:

* *node*.x - 节点中心的 *x*- 坐标
* *node*.y - 节点中心的 *y*- 坐标
* *node*.r - 圆的半径

在传入布局之前必须调用 [*root*.sum](#node_sum)。可能还需要调用 [*root*.sort](#node_sort) 对节点进行排序。

<a name="pack_radius" href="#pack_radius">#</a> <i>pack</i>.<b>radius</b>([<i>radius</i>]) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/pack/index.js#L30 "Source")

如果指定了 *radius* 则将半径访问器设置为指定的函数并返回 `pack` 布局。如果没有指定 *radius* 则返回当前半径访问器，默认为 `null`, 表示叶节点的圆的半径由叶节点的 *node*.value(通过 [*node*.sum](#node_sum) 计算) 得到；然后按照比例缩放以适应 [layout size](#pack_size)。如果半径访问器不为 `null` 则叶节点的半径由函数精确指定。

<a name="pack_size" href="#pack_size">#</a> <i>pack</i>.<b>size</b>([<i>size</i>]) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/pack/index.js#L34 "Source")

如果指定了 *size* 则将当前 `pack` 布局的尺寸设置为指定的二元数值类型数组: [*width*, *height*] 并返回当前 `pack` 布局。如果没有指定 *size* 则返回当前的尺寸，默认为 [1, 1]。

<a name="pack_padding" href="#pack_padding">#</a> <i>pack</i>.<b>padding</b>([<i>padding</i>]) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/pack/index.js#L38 "Source")

如果指定了 *padding* 则设置布局的间隔访问器为指定的数值或函数并返回 `pack` 布局。如果没有指定 *padding* 则返回当前的间隔访问器，默认为常量 `0`。当兄弟节点被打包时，节点之间的间隔会被设置为指定的间隔；外层包裹圆与字节点之间的间隔也会被设置为指定的间隔。如果没有指定 [explicit radius(明确的半径)](#pack_radius)，则间隔是近似的，因为需要一个双通道算法来适应 [layout size](#pack_size)：这些圆首先没有间隙；一个用于计算间隔的比例因子会被计算；最后，这些圆被填充了。

<a name="packSiblings" href="#packSiblings">#</a> d3.<b>packSiblings</b>(<i>circles</i>) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/pack/siblings.js "Source")

打包指定的一组 *circles*，每个圆必须包含 *circle*.r 属性用来表示圆的半径。每个圆会被附加以下属性：

* *circle*.x - 圆中心的 *x*- 坐标
* *circle*.y - 圆中心的 *y*- 坐标

这些圆是根据 [Wang *et al.*](https://dl.acm.org/citation.cfm?id=1124851) 等人的算法来定位。

<a name="packEnclose" href="#packEnclose">#</a> d3.<b>packEnclose</b>(<i>circles</i>) [<源码>](https://github.com/d3/d3-hierarchy/blob/master/src/pack/enclose.js "Source")

计算能包裹一组 *circles* 的 [smallest circle(最小圆)](https://en.wikipedia.org/wiki/Smallest-circle_problem)，每个圆必须包含 *circle*.r 属性表示半径，以及 *circle*.x 以及 *circle*.y 属性表示圆的中心，最小包裹圆的实现基于 [Matoušek-Sharir-Welzl algorithm](http://www.inf.ethz.ch/personal/emo/PublFiles/SubexLinProg_ALG16_96.pdf)。(也可以参考 [Apollonius’ Problem](https://bl.ocks.org/mbostock/751fdd637f4bc2e3f08b))
