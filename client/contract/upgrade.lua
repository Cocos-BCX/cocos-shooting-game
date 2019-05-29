function init()
	-- body
	if ( public_data.accuracy  == nil ) then
    	public_data.accuracy  = 100000
	end 

	write_list={public_data={accuracy=true}}
  	chainhelper:write_chain()
end

function equipment_upgrade( equipment_id, current_level) 
	read_list={public_data={accuracy=true}}
  	chainhelper:read_chain()
	--对当前输入的等级判断
	assert(current_level>0 and current_level<5, 'weapon level should between 1 and 4')

	--扣除升级所需开销
	chainhelper:transfer_from_caller(contract_base_info.owner,  100 * public_data.accuracy, 'COCOS', true)

	--升级成功判定，通过内源随机函数获取随机概率 local success_judge=random()%100 if(success_judge<=success_rate)then
	--将目标属性值写入域数据
	chainhelper:nht_describe_change( equipment_id, 'level', tostring(current_level + 1), true)

	local retTable = {};
	retTable['status'] = 1;
	retTable['equipmentId'] = equipment_id;
	retTable['level'] = tostring(current_level + 1);
	retTable['msg'] = 'upgrade success';

	chainhelper:log('##result##:' .. cjson.encode(retTable));

	write_list={public_data={}}
  	chainhelper:write_chain()
end