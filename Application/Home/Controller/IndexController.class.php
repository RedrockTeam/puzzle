<?php
namespace Home\Controller;
use Think\Controller;
class IndexController extends Controller {
	private $openid;
  	private $spendTime;//花费时间
	private $number;//比你强的人数
	private $list;//排名名单
	private $time;//时间戳
	private $string;//随机串
	private $secret;//签名
	private $jsapi_ticket;//jsapi-config
	public function index(){
		if (!I('code')) {
			$qs = $_SERVER['QUERY_STRING'] ? '?'.$_SERVER['QUERY_STRING']:$_SERVER['QUERY_STRING'];
	        $baseUrl = urlencode('http://'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'].$qs);
			Header("Location: https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx81a4a4b77ec98ff4&redirect_uri=". $baseUrl ."&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect "); 
			session('code') = I('code');//获取code
		}
		$this->info();
		$weixin =  file_get_contents("https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx81a4a4b77ec98ff4&secret=".$this->secret."&code=".I('code')."&grant_type=authorization_code");//通过code换取网页授权access_token
		$jsondecode = json_decode($weixin); //对JSON格式的字符串进行编码
		$array = get_object_vars($jsondecode);//转换成数组
		$this->openid = $array['openid'];//输出openid
		if ($this->openid) {
			$this->getVerify();
			$this->getTicket();
			$this->getName();
			$this->getStuid();
			$signature = $this->JSSDKSignature();
			$this->assign('signature', $signature);
			$this->display();
		}else {
			$this->error('网络错误，请重试');
		}
	}
	//ajax请求
	public function getRank() {
		$this->spendTime = I('spendTime');
		$this->saveRank();
   		//$this->rankList();
    	$this->ajaxReturn(array(
    		'status' => 200,
    		'data' => array_reverse(str_split($this->number, 1))
    	));
    	
    }
    //jssdk-config
	public function JSSDKSignature(){
        $string = $this->string;
        $data['jsapi_ticket'] = $this->jsapi_ticket;
        $data['noncestr'] = $this->string;
        $data['timestamp'] = $this->time;
        $data['url'] = 'http://'.$_SERVER['HTTP_HOST'].__SELF__;//生成当前页面url
        $data['signature'] = sha1($this->ToUrlParams($data));
        return $data;
    }
    private function ToUrlParams($urlObj){
        $buff = "";
        foreach ($urlObj as $k => $v) {
            if($k != "signature") {
                $buff .= $k . "=" . $v . "&";
            }
        }
        $buff = trim($buff, "&");
        return $buff;
    }
    //时间戳；签名；随机数
    private function info()
    {
    	$this->time = time();
	    $str = 'abcdefghijklnmopqrstwvuxyz1234567890ABCDEFGHIJKLNMOPQRSTWVUXYZ';
	    $this->string='';
	    for($i = 0; $i < 16; $i++){
	    	$num = mt_rand(0,61);
	        $this->string .= $str[$num];
	    }
      	$this->secret =sha1(sha1($this->time).md5($this->string)."redrock");
    }
    //判断关注
    private function getVerify(){
	    $t = array(
	      	'string' => $this->string,
			'token' => 'gh_68f0a1ffc303',
			'timestamp' => $this->time,
			'secret' => $this->secret,
			'openid' => $this->openid,
	    );
	    $url = "http://hongyan.cqupt.edu.cn/MagicLoop/index.php?s=/addon/Api/Api/openidVerify";
	    $result = $this->curl_api($url, $t);
	    if ($result->info == 'subscribe') {
	    	session('verify', $result->info);
	    }else{
	    	$this->error('没有关注小帮手');
	    }
	}
	//获取学号
	private function getStuid(){
	    $t = array(
	      	'string' => $this->string,
			'token' => 'gh_68f0a1ffc303',
			'timestamp' => $this->time,
			'secret' => $this->secret,
			'openid' => $this->openid,
	    );
	    $url = "http://hongyan.cqupt.edu.cn/MagicLoop/index.php?s=/addon/Api/Api/bindVerify";
	    $result = $this->curl_api($url, $t);
	    if ($result->stuId) {
	    	session('stuId', $result->stuId);
	    }else{
	    	$this->error('没有绑定小帮手');
	    }
	}
    //username获取
  	private function getName(){
	    $t = array(
	      	'string' => $this->string,
			'token' => 'gh_68f0a1ffc303',
			'timestamp' => $this->time,
			'secret' => $this->secret,
			'openid' => $this->openid,
	    );
	    $url = "http://hongyan.cqupt.edu.cn/MagicLoop/index.php?s=/addon/Api/Api/userInfo";
	    $result = $this->curl_api($url, $t);
	    session('username', $result->data->nickname);
	}
	private function getTicket(){
		$t = array(
      	'string' => $this->string,
		'token' => 'gh_68f0a1ffc303',
		'timestamp' => $this->time,
		'secret' => $this->secret,
		'openid' => $this->openid,
	    );
	    $url = "http://hongyan.cqupt.edu.cn/MagicLoop/index.php?s=/addon/Api/Api/apiJsticket";
	    $result = $this->curl_api($url, $t);
	    $this->ticket = $result->data;
	}
	/*curl通用函数*/
	private function curl_api($url, $data=''){
	    // 初始化一个curl对象
		$ch = curl_init();
		curl_setopt ( $ch, CURLOPT_URL, $url );
		curl_setopt ( $ch, CURLOPT_POST, 1 );
		curl_setopt ( $ch, CURLOPT_HEADER, 0 );
		curl_setopt ( $ch, CURLOPT_RETURNTRANSFER, 1 );
		curl_setopt ( $ch, CURLOPT_POSTFIELDS, $data );
		// 运行curl，获取网页。
		$contents = json_decode(curl_exec($ch));
		// 关闭请求
		curl_close($ch);
		return $contents;
	}
	//保存分数
	public function saveRank(){
	  	$m = M('score');
		$condition['openid'] = $this->openid;
		$data['score'] = '1'.$this->spendTime['kilobit'].$this->spendTime['hundreds'].$this->spendTime['decade'].$this->spendTime['theUnit'];
		$data['time'] = strtotime(Date("Y-m-d H:i:s")); 
		$judge = $m->where($condition)->find();
		if ($judge) {
			if ($judge['score'] > $data['score']) {
				$m->data($data)->where($condition)->save();
			}
		}else {
			$data['openid'] = $this->openid;
			$data['username'] = session('username');
			$data['stuId'] = session('stuId');
			$m->data($data)->add();
		}
		$this->number = $m->where('score' .'<='. $data['score'],'AND','time' .'<'. $data['time'])->count();
	}
	//排名
	public function rankList(){
	    $m = M('score');
	    $this->list = $m->order('score asc','AND','time asc')->limit(50)->select();
	    $this->assign('list',$this->list);
	}
}
