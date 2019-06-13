-- 奖池初始化
function init()
  -- 资产精度
  if ( public_data.accuracy  == nil ) then
      public_data.accuracy  = 100000
  end 

  -- 设置奖品列表
  if ( public_data.bomb == nil ) then
    public_data.bomb = { }
  end

  if ( public_data.weapon == nil ) then
    public_data.weapon = { }
  end

  if ( public_data.employee == nil ) then
     public_data.employee = { }
  end

  -- 设置概率
  if ( public_data.draw_radio == nil ) then
    public_data.draw_radio = { 5, 20, 20, 5, 5, 7, 20, 2, 15, 1}
    public_data.draw_name = { 'no','money','bomb', 'money', 'bomb','money','weapon','money', 'employee', 'money' }
    public_data.reward = { 0, 80, 1, 120, 2, 200, 1, 300, 1, 400}
  end
  write_list={public_data={accuracy=true, draw_radio=true, draw_name=true, reward=true}}
  chainhelper:write_chain()
  chainhelper:log('##result##:{"status": 1, "msg": "init finished!"}');
end

function put_reward (reward_type, item_ids)
  assert(chainhelper:is_owner(),'You`re not the contract`s owner')
  local arr_item_ids = cjson.decode(item_ids)
  read_list={public_data={bomb=true, weapon=true, employee=true}}
  chainhelper:read_chain()
  if ( public_data.bomb == nil ) then
    public_data.bomb = { }
  end

  if ( public_data.weapon == nil ) then
    public_data.weapon = { }
  end

  if ( public_data.employee == nil ) then
    public_data.employee = { }
  end

  if reward_type == 1 then
    public_data.bomb = { }
    for key,value in pairs(arr_item_ids) do
      local is_find = false
      for k, v in pairs(public_data.bomb) do
        if v == value then
         is_find = true
        end
      end

      if is_find == false then  
        table.insert(public_data.bomb, value);
      end
    end
  elseif reward_type == 2 then
    public_data.weapon = { }
    for key,value in pairs(arr_item_ids) do
      local is_find = false
      for k, v in pairs(public_data.weapon) do
        if v == value then
         is_find = true
        end
      end

      if is_find == false then  
        table.insert(public_data.weapon, value);
      end
    end
  elseif reward_type == 3 then
    public_data.employee = { }
    for key,value in pairs(arr_item_ids) do
      local is_find = false
      for k, v in pairs(public_data.employee) do
        if v == value then
         is_find = true
        end
      end

      if is_find == false then
        table.insert(public_data.employee, value);
      end
    end
  end
  write_list={public_data={bomb=true, weapon=true, employee=true}}
  chainhelper:write_chain()
  chainhelper:log('##result##:{"status": 1, "msg": "put_reward finished!", "bomb": ""}');
end

-- 抽奖
function draw( user_name, amount )
  -- 扣除投注额
  read_list={public_data={accuracy=true, draw_radio=true, draw_name=true, reward=true}}
  chainhelper:read_chain()
  
  chainhelper:transfer_from_caller(contract_base_info.owner,  amount * public_data.accuracy, 'COCOS', true)
 
  result = {} -- 抽奖结果
 
  -- 总权重
  local start_prop = 0
  local rand_value = chainhelper:random() % 100
  local current = 1
 
  -- 随机数匹配权重
  for key,value in pairs(public_data.draw_radio) do
    if ( rand_value < start_prop + value) then
      result['draw'] = public_data.draw_name[key]
      result['amount'] = public_data.reward[key]
      result['pos'] = key
      break
    else
      start_prop = start_prop + value
    end
  end

  -- result['draw'] = 'money'
  -- result['amount'] = 80
  -- result['pos'] = 1
  
  local reward_id = nil
  -- 发放奖金
  if ( result['draw'] == 'money' ) then
    --发放代币
    chainhelper:transfer_from_owner( user_name, result['amount'] * public_data.accuracy, 'COCOS', true)
  elseif (result['draw'] == 'bomb') then
    --发放炸弹
	  read_list={public_data={ bomb= true}}
    chainhelper:read_chain()
    local current_bomb = 0;
    while (current_bomb < result['amount']) do
      current_bomb = current_bomb + 1
      reward_id = table.remove(public_data.bomb)
    end
	  write_list=read_list
  elseif (result['draw'] == 'weapon') then
    --发放武器
    read_list={public_data={ weapon= true}}
	  chainhelper:read_chain()
    reward_id = table.remove(public_data.weapon)
    write_list=read_list
    
  elseif (result['draw'] == 'employee') then
    --发放员工
    read_list={public_data={ employee= true}}
	  chainhelper:read_chain()
    reward_id = table.remove(public_data.employee)
    write_list=read_list
    
  end

  if(result['draw'] ~= 'money'){
    if (reward_id) then
      chainhelper:transfer_nht_from_owner( user_name, reward_id, true)
    else
      --奖池空时的容错 --统一当没抽到奖励处理
      result['draw'] = 'no'
      result['amount'] = 0
      result['pos'] = 0
    end
  }
  
  chainhelper:write_chain()
  chainhelper:log('##result##:{"status": 1, "msg": "draw finished!", "draw": "'..result['draw']..'","amount":"'..result['amount']..'","pos":"'..result['pos']..'"}');
end

function getConfig()
 -- draw_table = public_data.draw_table
 -- accuracy = public_data.accuracy
 -- draw_pool = public_data.draw_pool
end

function getTableObjects()
  read_list={public_data={bomb=true, weapon=true, employee=true}}
  chainhelper:read_chain()

  local bomb = cjson.encode(public_data.bomb)
  chainhelper:log('#getTableObjects==bomb=#'..bomb)
  
  -- local bomb = cjson.encode(public_data.weapon)
  -- chainhelper:log('#getTableObjects==bomb=#'..weapon)

  -- local bomb = cjson.encode(public_data.employee)
  -- chainhelper:log('#getTableObjects==bomb=#'..employee)
 end