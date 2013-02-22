module.exports = function Renderer() {
  this.walk_var = function(var_node, vars) {
    return var_node.name;
  };

  this.walk_and = function(and_node, vars) {
    return "(" + and_node.left.walk_with(this, vars) + " && " + and_node.right.walk_with(this, vars) + ")";
  };

  this.walk_or = function(or_node, vars) {
    return "(" + or_node.left.walk_with(this, vars) + " || " + or_node.right.walk_with(this, vars) + ")";
  };

  this.walk_not = function(not_node, vars) {
    return "!" + not_node.refnode.walk_with(this, vars);
  };
};
