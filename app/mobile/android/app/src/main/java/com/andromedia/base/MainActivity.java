package com.andromedia.base;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import android.view.WindowManager;

public class MainActivity extends BridgeActivity {}

@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE);
}