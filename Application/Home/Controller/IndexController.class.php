<?php
  namespace Home\Controller;
  use Think\Controller;

class IndexController extends Controller {
  private $spendTime;//花费时间
	private $number;//比你强的人数
  private $list;//排名名单
  private $time;
  private $string;
  private $secret;
    public function index(){
      $secret =sha1(sha1($time).md5($string)."redrock");
    	if (session('code')) {
        $this->getOpenId();
    		$this->display();   		
    		}else{

    		$qs = $_SERVER['QUERY_STRING'] ? '?'.$_SERVER['QUERY_STRING']:$_SERVER['QUERY_STRING'];
            $baseUrl = urlencode('http://'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'].$qs);
          Header("Location: https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx81a4a4b77ec98ff4&redirect_uri=". $baseUrl ."&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect "); 
          $code = I('code');//获取code
          session('code',$code);
          $weixin =  file_get_contents("https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx81a4a4b77ec98ff4&secret=$this->secret&code=".$code."&grant_type=authorization_code");//通过code换取网页授权access_token
          $jsondecode = json_decode($weixin); //对JSON格式的字符串进行编码
          $array = get_object_vars($jsondecode);//转换成数组
          $openid = $array['openid'];//输出openid 
          session('openid',$openid);
          $this->getOpenId();
          $signature = array(
          	'timestamp' => time(),
          	'string' => $this->string,
          	'signature' => $this->secret
          );
          $this->assign('signature', $signature);
          $this->display();
          if (!session('openid')) {
            $this->error('网络连接错误');
          }
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
  //openid获取
  private function getOpenId(){
	  $code = session('code');
    $time = time();
    $str = 'abcdefghijklnmopqrstwvuxyz1234567890ABCDEFGHIJKLNMOPQRSTWVUXYZ';
    $this->string='';
    for($i=0;$i<16;$i++){
    	$num = mt_rand(0,61);
          $this->string .= $str[$num];
      }
    if (!session('openid')){
      $t1 = array(
      	'string' => $this->string,
            'token' => 'gh_68f0a1ffc303',
            'timestamp' => $this->time,
            'secret' => $this->secret,
            'code' => $code,
      );
      $url1 = "http://hongyan.cqupt.edu.cn/MagicLoop/index.php?s=/addon/Api/Api/webOauth";
      $openid = $this->curl_api($url1, $t1);
      session('openid',$openid);
    }
    $t2 = array(
      'string' => $this->string,
          'token' => 'gh_68f0a1ffc303',
          'timestamp' => $this->time,
          'secret' => $this->secret,
          'openid' => $openid,
    );
    $url2 = "http://hongyan.cqupt.edu.cn/MagicLoop/index.php?s=/addon/Api/Api/userInfo";
    session('username',$this->curl_api($url2, $t2)['data']['nickname']);
    
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
      $condition['openid'] = session('openid');
      $data['score'] = '1'.$this->spendTime['kilobit'].$this->spendTime['hundreds'].$this->spendTime['decade'].$this->spendTime['theUnit'];
      $data['time'] = strtotime(Date("Y-m-d H:i:s")); 

      $judge = $m->where($condition)->find();
      if ($judge) {
      	if ($judge['score'] > $data['score']) {
        	$m->data($data)->where($condition)->save();
      	}
      }else {
        $data['openid'] = session('openid');
        $data['username'] = session('username');
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