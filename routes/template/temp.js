var TEMPLATE = {
  MESSAGE : {
    JOIN_SPACE : '<a href="javascript:void(0);" class="list-group-item"><h4 class="list-group-item-heading">{content}</h4><p class="list-group-item-text"><button userId="{userId}" spaceId="{spaceId}" type="button" class="joinSpace btn btn-success btn-xs">accept</button>&nbsp;<button type="button" class="btn btn-danger btn-xs">reject</button></p></a>',
    LEAVE_SPACE : '<a href="javascript:void(0);" class="list-group-item"><h4 class="list-group-item-heading">{content}</h4><p class="list-group-item-text"><button type="button" class="btn btn-default btn-xs">ok</button></p></a>'
  }
};

module.exports = TEMPLATE;
