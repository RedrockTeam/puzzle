<?php
	namespace Home\Controller;
	use Think\Controller;
	class IndexController extends Controller {
	    public function index(){
	        $this->display();
	    }

	    public function getRank() {
	    	$this->ajaxReturn(array(
	    		'status' => 200,
	    		'data' => array_reverse(str_split('234', 1))
	    	));
	    }
	}